import * as chai from 'chai'

import * as Logic from '../../logic'
import { EventInterface, InitialisedRecordInfoInterface } from '../../interfaces'

const expect = chai.expect

const dummyTask: EventInterface = {
    requestId: 'dummyRequestID',
    containerId: 'dummyContainerID',
    service: 'dummyService',
    responseBody: ''
}

describe('logic -> getParsedResponseInfo', function () {

    it('should process a task to response correctly', function () {
        const dummyExistingRecordInfo: InitialisedRecordInfoInterface = {
            task: 'NUMBER',
            subtask: 'ADD',
            containerId: '',
            containerService: '',
            recordId: '',
            responseBody: 'dummyExistingRecordInfo',
            serviceContainerId: '',
            serviceContainerService: ''
        }

        const response: EventInterface = Logic.getParsedResponseInfo(dummyTask, dummyExistingRecordInfo)

        expect(response.recordId).to.equal(dummyTask.recordId)
        expect(response.containerId).to.equal(dummyTask.containerId)
        expect(response.service).to.equal(dummyTask.service)
        expect(response.responseBody).to.equal(dummyExistingRecordInfo.responseBody)

    })
})

describe('logic -> parseEventFromRecordInfo', function () {

    it('should process all initialised record info to event correctly', function () {
        const dummyInitRecordInfo: InitialisedRecordInfoInterface = {
            chosenContainerId: 'dummyChosenContainerId',
            chosenContainerService: 'dummyChosenContainerService',
            recordId: '',
            task: 'NUMBER',
            subtask: 'ADD',
            serviceContainerId: '',
            serviceContainerService: '',
            requestBody: '',
            containerId: '',
            containerService: ''
        }

        const event: EventInterface = Logic.parseEventFromRecordInfo(dummyInitRecordInfo)

        expect(event.containerId).to.equal(dummyInitRecordInfo.chosenContainerId)
        expect(event.service).to.equal(dummyInitRecordInfo.chosenContainerService)
    })
})