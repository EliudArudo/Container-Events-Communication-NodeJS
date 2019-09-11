import { DockerAPI } from "../docker-api";
import { EventInterface, EventTaskType, ContainerInfoInterface, InitialisedRecordInfoInterface } from "../interfaces";
import { redisPublisher } from "../initialise/redis";
import { ConsumingService } from "../env";
import { recordNewTaskInDB, completeExistingTaskRecordInDB } from "../database-ops";
import { logStatusFileMessage } from "../log";

const FILENAME = 'logic/index.ts'

export async function EventDeterminer(sentEvent: string): Promise<void> {
    try {
        const event: EventInterface = JSON.parse(sentEvent)

        const offlineContainerInfo: ContainerInfoInterface = DockerAPI.fetchOfflineContainerInfo();
        const eventIsOurs = event.serviceContainerId === offlineContainerInfo.id &&
            event.serviceContainerService === offlineContainerInfo.service

        const taskType: EventTaskType = event.responseBody ? 'RESPONSE' :
            event.requestBody ? 'TASK' :
                null

        const isResponseEvent = taskType === 'RESPONSE'

        if (isResponseEvent && !eventIsOurs)
            return

        switch (taskType) {
            case 'TASK':
                await recordAndAllocateTask(event)
                break;
            case 'RESPONSE':
                await modifyDatabaseAndSendBackResponse(event)
                break;
        }

    } catch (e) {
        logStatusFileMessage('Failure', FILENAME, 'EventDeterminer', e.message)
    }
}


function getParsedResponseInfo(task: EventInterface, existingRecordInfo: InitialisedRecordInfoInterface): EventInterface {
    const parsedResponseInfo: EventInterface = {
        containerId: task.containerId,
        service: task.subtask,
        responseBody: existingRecordInfo.responseBody
    }

    return parsedResponseInfo
}

async function recordAndAllocateTask(task: EventInterface): Promise<void> {
    try {
        const initRecordInfo: InitialisedRecordInfoInterface = await recordNewTaskInDB(task)
        if (initRecordInfo!.existing) {
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
            `failed to get initRecordInfo`)
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
