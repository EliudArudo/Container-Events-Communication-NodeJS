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
    try {
        const existingRequestDocument = await MongoDBRequest.findOne({
            request
        })

        const ID = existingRequestDocument._id

        return ID

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getExistingRequestDocumentID',
            `failed connect to make request to MongoDBRequest`)
    }
}

async function getExistingTask(task: EventInterface): Promise<Document> {
    try {
        const fromContainerService = task.service
        const fromTask = task.task
        const fromSubtask = task.subtask
        const requestBodyId = await getExistingRequestDocumentID(task.requestBody)

        const existingRecord = await MongoDBTask.findOne({
            fromContainerService,
            fromTask,
            fromSubtask,
            requestBodyId
        })

        return existingRecord
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getExistingTask',
            `failed connect to get an existing Task record`)
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
            responseBody: response['response'],

            chosenContainerId: selectedContainerInfo.id,
            chosenContainerService: selectedContainerInfo.service
        }

        return parsedTask
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getNewParsedTask',
            `failed connect to find an existing MongoDBResponse`)
    }

}

async function saveNewRequestAndGetID(requestBody: string): Promise<string> {
    try {
        const request: Document = await new MongoDBRequest({
            request: requestBody
        })

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

        const newTask: Document = await new MongoDBTask(newInitTaskRecord)
        const parsedTask = getNewParsedTask(newTask, selectedContainerInfo)

        return parsedTask

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordNewInitialisedTaskWithRequestId',
            `failed to record new initialised task with request ID`)
    }
}

async function recordNewTaskAndRequest(funcTask: EventInterface): Promise<InitialisedRecordInfoInterface> {
    try {

        const requestBodyId: string = await saveNewRequestAndGetID(funcTask.requestBody)
        const initialisedInfo: InitialisedRecordInfoInterface = await recordNewInitialisedTaskWithRequestId(funcTask, requestBodyId)

        return initialisedInfo
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'recordNewTaskAndRequest',
            `failed to record new initialised task with request`)
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

export function getParsedResponse(funcResponse: EventInterface): EventInterface {
    const response: EventInterface = {
        containerId: funcResponse.containerId,
        service: funcResponse.service,
        responseBody: funcResponse.responseBody
    }

    return response
}

async function saveNewResponseAndGetID(responseBody: string): Promise<string> {
    try {
        const response: Document = await new MongoDBResponse({
            response: responseBody
        })

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

        const toReceivedTime = new Date()
        const toResponseBodyId: string = await saveNewResponseAndGetID(funcResponse.responseBody)

        await completeRecordInDB(funcResponse, toReceivedTime, toResponseBodyId)

        const response: EventInterface = getParsedResponse(funcResponse)

        return response

    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'completeExistingTaskRecordInDB',
            `failed to complete existing task record in DB`)
    }
}