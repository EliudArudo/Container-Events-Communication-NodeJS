import { InitialisedRecordInfoInterface, EventInterface, MongoDBTaskSchemaInterface } from "../interfaces"
import { MongoDBTask } from "../models/mongodb/tasks"
import { Document } from "mongoose"
import { MongoDBRequest } from "../models/mongodb/requests"
import { MongoDBResponse } from './../models/mongodb/responses'
import { DockerAPI } from "../docker-api"
import { ContainerInfoInterface } from './../interfaces/index'
import { getSelectedContainerIdAndService } from "../util"
import { logStatusFileMessage } from "../log"

const FILENAME = "/database-ops/index.ts"


async function getExistingRequestDocumentID(request: string): Promise<string> {
    let existingRequestDocumentID: string
    try {
        const existingRequestDocument: Document = await MongoDBRequest.findOne({
            request
        })

        if (existingRequestDocument)
            return existingRequestDocument._id

        return existingRequestDocumentID
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getExistingRequestDocumentID',
            `failed to get an existing ID with error: 
            ${e}`)
        return existingRequestDocumentID
    }
}


async function getExistingTask(task: EventInterface): Promise<Document> {
    let existingRecord: Document
    try {
        const fromContainerService = task.service
        const fromTask = task.task
        const fromSubtask = task.subtask
        const requestBodyId = await getExistingRequestDocumentID(task.requestBody)

        if (requestBodyId) {
            existingRecord = await MongoDBTask.findOne({
                fromContainerService,
                task: fromTask,
                subtask: fromSubtask,
                requestBodyId
            })
        }

        return existingRecord
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getExistingTask',
            `failed get an existing Task record`)
        return existingRecord
    }
}


async function getExistingParsedTask(mongoDBTask: Document): Promise<InitialisedRecordInfoInterface> {
    try {
        const toResponseBodyId = mongoDBTask['toResponseBodyId']
        const response = await MongoDBResponse.findById(toResponseBodyId)

        const parsedTask: InitialisedRecordInfoInterface = {
            containerId: mongoDBTask['fromContainerId'],
            containerService: mongoDBTask['fromContainerService'],
            recordId: mongoDBTask._id,
            task: mongoDBTask['task'],
            subtask: mongoDBTask['subtask'],
            serviceContainerId: mongoDBTask['serviceContainerId'],
            serviceContainerService: mongoDBTask['serviceContainerService'],
            responseBody: response['response']
        }

        return parsedTask
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getExistingParsedTask',
            `failed connect to find an existing MongoDBResponse`)
    }

}


async function getNewParsedTask(mongoDBTask: Document, selectedContainerInfo: ContainerInfoInterface): Promise<InitialisedRecordInfoInterface> {
    const parsedTask: InitialisedRecordInfoInterface = {
        containerId: mongoDBTask['fromContainerId'],
        containerService: mongoDBTask['fromContainerService'],
        recordId: mongoDBTask._id,
        task: mongoDBTask['task'],
        subtask: mongoDBTask['subtask'],
        serviceContainerId: mongoDBTask['serviceContainerId'],
        serviceContainerService: mongoDBTask['serviceContainerService'],
        chosenContainerId: selectedContainerInfo.id,
        chosenContainerService: selectedContainerInfo.service
    }

    try {
        const toResponseBodyId = mongoDBTask['toResponseBodyId']
        const response = await MongoDBResponse.findById(toResponseBodyId)
        if (response)
            parsedTask.responseBody = response['response']

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getNewParsedTask',
            `failed connect to find an existing MongoDBResponse`)
    } finally {
        return parsedTask
    }

}


async function saveNewRequestAndGetID(requestBody: string): Promise<string> {
    try {
        const request: Document = await new MongoDBRequest({
            request: requestBody
        }).save()

        const ID = request._id

        return ID

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'saveNewRequestAndGetID',
            `failed save a new MongoDBrequest`)
    }
}


async function recordNewInitialisedTaskWithRequestId(funcTask: EventInterface, requestBodyId: string): Promise<InitialisedRecordInfoInterface> {
    try {
        const fromRequestId = funcTask.requestId
        const fromContainerId = funcTask.containerId
        const fromContainerService = funcTask.service
        const fromReceivedTime = new Date()
        const task = funcTask.task
        const subtask = funcTask.subtask

        const selectedContainerInfo: ContainerInfoInterface = await getSelectedContainerIdAndService(funcTask)

        const toContainerId = selectedContainerInfo.id
        const toContainerService = selectedContainerInfo.service

        const myContainerInfo: ContainerInfoInterface = DockerAPI.fetchOfflineContainerInfo()

        const serviceContainerId = myContainerInfo.id
        const serviceContainerService = myContainerInfo.service

        const newInitTaskRecord: MongoDBTaskSchemaInterface = {
            fromRequestId,
            fromContainerId,
            fromContainerService,
            fromReceivedTime,
            task,
            subtask,
            requestBodyId,
            toContainerId,
            toContainerService,
            serviceContainerId,
            serviceContainerService
        }

        const newTask: Document = await new MongoDBTask(newInitTaskRecord).save()
        const parsedTask = getNewParsedTask(newTask, selectedContainerInfo)

        return parsedTask

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordNewInitialisedTaskWithRequestId',
            `failed to record new initialised task with request ID with error:
            ${e}`)
    }
}


async function recordNewTaskAndRequest(funcTask: EventInterface): Promise<InitialisedRecordInfoInterface> {
    try {
        const requestBodyId: string = await saveNewRequestAndGetID(funcTask.requestBody)
        const initialisedInfo: InitialisedRecordInfoInterface = await recordNewInitialisedTaskWithRequestId(funcTask, requestBodyId)

        initialisedInfo.requestBody = funcTask.requestBody

        return initialisedInfo
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordNewTaskAndRequest',
            `failed to record new initialised task with request with error
            ${e}`)
    }
}


export async function recordNewTaskInDB(task: EventInterface): Promise<InitialisedRecordInfoInterface> {
    try {

        const existingTask: Document = await getExistingTask(task)

        if (existingTask) {
            const parsedTask: InitialisedRecordInfoInterface =
                await getExistingParsedTask(existingTask)

            parsedTask.existing = true

            return parsedTask
        }

        const initRecordInfo: InitialisedRecordInfoInterface = await recordNewTaskAndRequest(task)
        return initRecordInfo

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordNewTaskInDB',
            `failed to record new in the database`)
    }
}


export function getParsedResponse(funcResponse: EventInterface, oldTask: Document): EventInterface {
    const response: EventInterface = {
        requestId: oldTask['fromRequestId'],
        containerId: oldTask['fromContainerId'],
        service: oldTask['fromContainerService'],
        responseBody: funcResponse.responseBody
    }

    return response
}


async function saveNewResponseAndGetID(responseBody: string): Promise<string> {
    try {
        const response: Document = await new MongoDBResponse({
            response: responseBody
        }).save()

        const ID = response._id

        return ID

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'saveNewResponseAndGetID',
            `failed to save a new MongoDBResponse`)
    }
}

export async function completeRecordInDB(funcResponse: EventInterface, receivedTime: Date, responseBodyId: string): Promise<void> {
    try {
        const fromSentTime = new Date()
        const newData = {
            toReceivedTime: receivedTime,
            toResponseBodyId: responseBodyId,
            fromSentTime
        }

        await MongoDBTask.findByIdAndUpdate(funcResponse.recordId, newData)

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'completeRecordInDB',
            `failed to find MongoDBTask by id`)
    }
}


export async function completeExistingTaskRecordInDB(funcResponse: EventInterface): Promise<EventInterface> {
    try {
        const preexistingResponse = await MongoDBResponse.findOne({ response: funcResponse.responseBody })
        if (!preexistingResponse) {
            const toReceivedTime = new Date()
            const toResponseBodyId: string = await saveNewResponseAndGetID(funcResponse.responseBody)
            await completeRecordInDB(funcResponse, toReceivedTime, toResponseBodyId)
        }

        const task: Document = await MongoDBTask.findById(funcResponse.recordId)
        const response: EventInterface = getParsedResponse(funcResponse, task)

        return response

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'completeExistingTaskRecordInDB',
            `failed to complete existing task record in DB`)
    }
}