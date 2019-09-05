import { ContainerInfo } from "../docker-api";

import { ReceivedEventInterface, EventTaskType, ContainerInfoInterface } from "../interfaces";
import { logStatusFileMessage } from "../log";
import { redisPublisher } from "../initialise/redis";
import { EventService } from './../env/index'

const FILENAME = 'logic/index.ts'

export function EventDeterminer(sentEvent: string, functionContainerInfo: ContainerInfo): void {
    const event: ReceivedEventInterface = JSON.parse(sentEvent)

    const offlineContainerInfo: ContainerInfoInterface = functionContainerInfo.fetchOfflineContainerInfo();
    const eventIsOurs = event.containerId === offlineContainerInfo.id &&
        event.service === offlineContainerInfo.service

    const taskType: EventTaskType = event.responseBody ? 'RESPONSE' :
        event.requestBody ? 'TASK' :
            null

    if (!eventIsOurs)
        return

    switch (taskType) {
        case 'TASK':
            performTaskAndRespond(event)
            break;
        case 'RESPONSE':
            returnResponse(event)
            break;
    }
}


function sendResultsToEventService(task: ReceivedEventInterface, results: any): void {
    const {
        containerId,
        service,
        recordId,
        serviceContainerId,
        serviceContainerService
    } = task

    const requestBody = JSON.stringify(results)

    const event: ReceivedEventInterface = {
        containerId,
        service,
        recordId,
        serviceContainerId,
        serviceContainerService,
        requestBody
    }

    const stringifiedEvents: string = JSON.stringify(event)

    redisPublisher.publish(EventService, stringifiedEvents)
}

function performTaskAndRespond(task: ReceivedEventInterface): void {
    logStatusFileMessage(
        'Success',
        FILENAME,
        'performTask',
        `${task}`)
    const results = performLogic(task)
    sendResultsToEventService(task, results)
}

function returnResponse(response: ReceivedEventInterface): void {
    logStatusFileMessage(
        'Success',
        FILENAME,
        'returnResponse',
        `Return this to the user :${response}`)
}


// LOGIC - Dev Logic
function performLogic(task: ReceivedEventInterface): any {
    let result: any
    const data = JSON.parse(task.requestBody)
    const item1 = data[Object.keys(data)[0]]
    const item2 = data[Object.keys(data)[1]]

    if (task.task === 'STRING' && task.subtask === 'ADD')
        result = devAddStrings(item1, item2)
    else {
        result = task.subtask === 'ADD' ?
            devAddNumber(item1, item2) :
            task.subtask === 'SUBTRACT' ?
                devSubtractNumber(item1, item2) :
                task.subtask === 'MULTIPLY' ?
                    devMultiplyNumber(item1, item2) :
                    task.subtask === 'DIVIDE' ?
                        devDivideNumber(item1, item2) :
                        null
    }

    return result
}

function devAddStrings(string1: string, string2: string): string {
    const concatString = string1 + string2
    return concatString
}

function devAddNumber(number1: number, number2: number): number {
    const addedNumber = number1 + number2
    return addedNumber
}

function devSubtractNumber(number1: number, number2: number): number {
    const subtractedNumber = number1 - number2
    return subtractedNumber
}

function devMultiplyNumber(number1: number, number2: number): number {
    const multipliedNumber = number1 * number2
    return multipliedNumber
}

function devDivideNumber(number1: number, number2: number): number {
    const dividedNumber = number1 / number2
    return dividedNumber
}

