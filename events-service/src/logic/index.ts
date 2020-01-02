import { DockerAPI } from "../docker-api";
import { EventInterface, EventTaskType, ContainerInfoInterface, InitialisedRecordInfoInterface } from "../interfaces";
import { redisPublisher } from "../initialise/redis";
import { ConsumingService } from "../env";
import { recordNewTaskInDB, completeExistingTaskRecordInDB } from "../database-ops";
import { logStatusFileMessage } from "../log";

const FILENAME = 'logic/index.ts'


export async function EventDeterminer(sentEvent: string): Promise<void> {

    let event: EventInterface = JSON.parse(sentEvent)

    if (typeof event === 'string') {
        event = JSON.parse(event)
    }

    const offlineContainerInfo: ContainerInfoInterface = DockerAPI.fetchOfflineContainerInfo();

    const eventIsOurs = event.serviceContainerId === offlineContainerInfo.id &&
        event.serviceContainerService === offlineContainerInfo.service

    let taskType: EventTaskType = event.responseBody ? 'RESPONSE' :
        event.requestId ? 'TASK' :
            null


    /// Clearing glitch
    if (!taskType) {
        event.responseBody = event.requestBody
        event.requestBody = null
        taskType = 'RESPONSE'
    }
    /// Clearing glitch

    if (!eventIsOurs)
        return

    switch (taskType) {
        case 'TASK':
            await recordAndAllocateTask(event)
            break;
        case 'RESPONSE':
            await modifyDatabaseAndSendBackResponse(event)
            break;
    }
}


function getParsedResponseInfo(task: EventInterface, existingRecordInfo: InitialisedRecordInfoInterface): EventInterface {
    const parsedResponseInfo: EventInterface = {
        requestId: task.requestId,
        containerId: task.containerId,
        service: task.service,
        responseBody: existingRecordInfo.responseBody
    }

    return parsedResponseInfo
}

async function recordAndAllocateTask(task: EventInterface): Promise<void> {
    try {
        const initRecordInfo: InitialisedRecordInfoInterface = await recordNewTaskInDB(task)

        if (initRecordInfo && initRecordInfo.existing) {
            const responseInfo: EventInterface = getParsedResponseInfo(task, initRecordInfo)
            sendEventToContainer(responseInfo)
            return
        }

        allocateTaskToConsumingContainer(initRecordInfo)

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordAndAllocateTask',
            `failed to get initRecordInfo with error:
            ${e}`)
    }
}

async function modifyDatabaseAndSendBackResponse(response: EventInterface): Promise<void> {

    try {
        const responseInfo: EventInterface = await completeExistingTaskRecordInDB(response)
        sendEventToContainer(responseInfo)

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordAndAllocateTask',
            `failed to get responseInfo`)
    }
}


// Redis ops
function sendEventToContainer(eventInfo: EventInterface): void {
    const stringifiedResponse: string = JSON.stringify(eventInfo)
    redisPublisher.publish(ConsumingService, stringifiedResponse)
}

// DockerAPI ops

function parseEventFromRecordInfo(initRecordInfo: InitialisedRecordInfoInterface): EventInterface {
    const event: EventInterface = {
        containerId: initRecordInfo.chosenContainerId,
        service: initRecordInfo.chosenContainerService,
        recordId: initRecordInfo.recordId,
        task: initRecordInfo.task,
        subtask: initRecordInfo.subtask,
        serviceContainerId: initRecordInfo.serviceContainerId,
        serviceContainerService: initRecordInfo.serviceContainerService,
        requestBody: initRecordInfo.requestBody
    }

    return event
}


function allocateTaskToConsumingContainer(initRecordInfo: InitialisedRecordInfoInterface): void {
    const eventToSend: EventInterface = parseEventFromRecordInfo(initRecordInfo)
    sendEventToContainer(eventToSend)
}
