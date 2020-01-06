import * as UniqueID from 'uniqid'

import { ContainerInfo } from "../docker-api"
import { redisPublisher } from './../initialise/redis'
import { EventService } from "../env"
import { RedisClient } from "redis"
import { ContainerInfoInterface, TaskInterface, TASK_TYPE, SUB_TASK_TYPE, ReceivedEventInterface } from "../interfaces"
import { logStatusFileMessage } from "../log"
import { getResponseFromBuffer, responseBuffer } from '../util'

/*
  ADD takes { a1, a2 }
  MULTIPLY takes { m1, m2 }
  SUBTRACT takes { s1, s2 }
  DIVIDE takes { d1, d2 }
*/

const FILENAME = 'tasks/index.ts'

const WAITINGTIMEFORRESPONSE: number = 10

export function DetermineTask(requestBody: any): TASK_TYPE {
    let task: TASK_TYPE
    let isString: boolean
    let isNumber: boolean
    for (const key in requestBody) {
        isString = typeof requestBody[key] === 'string'
        isNumber = typeof requestBody[key] === 'number'
    }

    task = isString ?
        'STRING' :
        isNumber ?
            'NUMBER' :
            null

    return task
}

export function DetermineSubTask(task: TASK_TYPE, requestBody: any): SUB_TASK_TYPE {
    let subtask: SUB_TASK_TYPE;

    switch (task) {
        case 'STRING':
            subtask = 'ADD'
            break;
        case 'NUMBER':
            let isAddition: boolean,
                isSubtraction: boolean,
                isMultiplication: boolean,
                isDivision: boolean;

            for (const key in requestBody) {
                isAddition = key.includes('a')
                isSubtraction = key.includes('s')
                isMultiplication = key.includes('m')
                isDivision = key.includes('d')
            }

            subtask =
                isAddition ? 'ADD' :
                    isSubtraction ? 'SUBTRACT' :
                        isMultiplication ? 'MULTIPLY' :
                            isDivision ? 'DIVIDE' :
                                null
            break;

    }

    return subtask

}


/* Continue from here */
export async function TaskDeterminer(requestBody: any, containerInfo: ContainerInfo): Promise<TaskInterface> {

    try {
        const task: TASK_TYPE = DetermineTask(requestBody)
        const subtask: SUB_TASK_TYPE = DetermineSubTask(task, requestBody)

        if (!task || !subtask) {
            throw new Error('Task not properly categorised')
        }

        const myContainerInfo: ContainerInfoInterface =
            await containerInfo.fetchContainerInfo()

        const requestId = UniqueID()

        // -> Event container chooser
        const chosenContainer: ContainerInfoInterface = await containerInfo.fetchEventContainer()

        const exportTask: TaskInterface = {
            task,
            subtask,
            containerId: myContainerInfo.id,
            service: myContainerInfo.service,
            requestId,
            requestBody: JSON.stringify(requestBody),
            serviceContainerId: chosenContainer.id,
            serviceContainerService: chosenContainer.service
        }
        return exportTask
        // Determiner chunk here
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'TaskDeterminer',
            `${e}`)
    }

}

function sendTaskToEventsService(task: TaskInterface, functionRedisPublisher: RedisClient): void {
    functionRedisPublisher.publish(EventService, JSON.stringify(task))
}


function setTimeoutAsync(time: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(_ => resolve(), time)
    })
}


async function waitForResult(requestId: string): Promise<any> {
    try {

        let response: ReceivedEventInterface = getResponseFromBuffer(requestId)

        while (!response || !response.responseBody) {
            await setTimeoutAsync(WAITINGTIMEFORRESPONSE)
            response = getResponseFromBuffer(requestId)
        }

        return response.responseBody

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'waitForResult',
            `Failed to wait for result with error: 
             e:${e}`)
    }
}


export async function TaskController(requestBody: any, containerInfo: ContainerInfo): Promise<any> {
    try {
        const task: TaskInterface = await TaskDeterminer(requestBody, containerInfo)
        sendTaskToEventsService(task, redisPublisher)

        const response = await waitForResult(task.requestId)

        return response
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'TaskController',
            `${e.message}`)
    }
}
