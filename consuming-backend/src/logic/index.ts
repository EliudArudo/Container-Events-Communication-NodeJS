import { ContainerInfo } from "../docker-api";

import { ReceivedEventInterface, EventTaskType, ContainerInfoInterface } from "../interfaces";
import { logStatusFileMessage } from "../log";
import { redisPublisher } from "../initialise/redis";
import { EventService } from './../env/index'

const FILENAME = 'logic/index.ts'

export async function EventDeterminer(sentEvent: string, functionContainerInfo: ContainerInfo): Promise<void> {

    let event: ReceivedEventInterface = JSON.parse(sentEvent)

    if (typeof event === 'string') {
        event = JSON.parse(event)
    }

    const offlineContainerInfo: ContainerInfoInterface = functionContainerInfo.fetchOfflineContainerInfo()
    const eventIsOurs = event.containerId === offlineContainerInfo.id &&
        event.service === offlineContainerInfo.service

    const taskType: EventTaskType = event.responseBody ? 'RESPONSE' :
        event.requestBody ? 'TASK' :
            null

    if (!eventIsOurs)
        return

    /*
      Should always receive tasks, but leaving 'RESPONSE' here ensures that
      backend services can be abrtracted further down, send tasks and get response
    */

    switch (taskType) {
        case 'TASK':
            performTaskAndRespond(event)
            break;
        case 'RESPONSE':
            // Backend not meant to receive any tasks
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

    const responseBody = JSON.stringify(results)

    const event: ReceivedEventInterface = {
        containerId,
        service,
        recordId,
        serviceContainerId,
        serviceContainerService,
        responseBody
    }

    const stringifiedEvents: string = JSON.stringify(event)

    redisPublisher.publish(EventService, stringifiedEvents)
}

function performTaskAndRespond(task: ReceivedEventInterface): void {
    const results = performLogic(task)
    sendResultsToEventService(task, results)
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

