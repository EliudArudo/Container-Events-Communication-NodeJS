import * as os from 'os'
import * as chai from 'chai'
import * as sinon from 'sinon'

import * as Tasks from '../../tasks/index'
import * as Util from '../../util/index'

import { TASK_TYPE, SUB_TASK_TYPE, ReceivedEventInterface } from '../../interfaces/index'
import { ContainerInfo } from '../../docker-api'
import * as NodeDockerAPI from 'node-docker-api'
import { TaskInterface } from '../../interfaces'
import { Task } from 'node-docker-api/lib/task'
import { before } from 'mocha'

const expect = chai.expect
const assert = chai.assert

const numbersAddRequestBody = { a1: 3, a2: 4 }
const stringRequestBody = { s1: 'a', s2: 'b' }
const erroneousStringRequestBody = { x1: 'a', x2: 'b' }
const numbersSubtractRequestBody = { s1: 3, s2: 4 }
const numbersMultiplyRequestBody = { m1: 3, m2: 4 }
const numbersDivideRequestBody = { d1: 3, d2: 4 }
const emptyRequestBody = {}
const invalidRequestBody = ''

const NUMBER_TASK_TYPE: TASK_TYPE = 'NUMBER'
const STRING_TASK_TYPE: TASK_TYPE = 'STRING'

const ADD_SUB_TASK_TYPE: SUB_TASK_TYPE = 'ADD'
const SUBTRACT_SUB_TASK_TYPE: SUB_TASK_TYPE = 'SUBTRACT'
const MULTIPLY_SUB_TASK_TYPE: SUB_TASK_TYPE = 'MULTIPLY'
const DIVIDE_SUB_TASK_TYPE: SUB_TASK_TYPE = 'DIVIDE'


function jsonifyObject(object: any): string {
    return JSON.stringify(object)
}

describe("tasks -> DetermineTask", function () {
    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE} on requestBody = ${JSON.stringify(numbersAddRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(numbersAddRequestBody)

        assert.typeOf(determinedTask, 'string')
        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE} on requestBody = ${JSON.stringify(stringRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(stringRequestBody)

        assert.typeOf(determinedTask, 'string')
        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
    })

    it(`should return null if fields are empty on requestBody = ${JSON.stringify(emptyRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(emptyRequestBody)

        expect(determinedTask).to.be.null
    })
})

describe("tasks -> DetermineSubTask", function () {

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersAddRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(numbersAddRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, numbersAddRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${SUBTRACT_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersSubtractRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(numbersSubtractRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, numbersSubtractRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(SUBTRACT_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${MULTIPLY_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersMultiplyRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(numbersMultiplyRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, numbersMultiplyRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(MULTIPLY_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${DIVIDE_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersDivideRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(numbersDivideRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, numbersDivideRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(DIVIDE_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(stringRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(stringRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, stringRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} despite requestBody = ${JSON.stringify(erroneousStringRequestBody)}`, function () {
        const determinedTask = Tasks.DetermineTask(stringRequestBody)
        const determinedSubTask = Tasks.DetermineSubTask(determinedTask, erroneousStringRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })


    it(`should return undefined SUB_TASK_TYPE if TASK_TYPE is null`, function () {
        const determinedSubTask = Tasks.DetermineSubTask(null, erroneousStringRequestBody)

        expect(determinedSubTask).to.be.undefined
    })

})


describe("tasks -> TaskDeterminer", function () {
    let tasksMock: sinon.SinonMock

    const myContainerName = os.hostname()

    const dummyRawDockerContainers = [
        {
            data: {
                Id: myContainerName,
                Labels: {
                    'com.docker.swarm.service.name': 'container-1'
                }
            }
        },
        {
            data: {
                Id: 'container-2',
                Labels: {
                    'com.docker.swarm.service.name': 'container-1'
                }
            }
        }
    ]

    let dockerClientStub: sinon.SinonStub

    const containerInfoSpy = new ContainerInfo()
    let getSelectedEventContainerIdAndServiceStub: any

    beforeEach(function () {
        dockerClientStub = sinon.stub(NodeDockerAPI, 'Docker')
        tasksMock = sinon.mock(Tasks)

        getSelectedEventContainerIdAndServiceStub = sinon.stub(Util, 'getSelectedEventContainerIdAndService').resolves({
            id: '',
            service: ''
        })

        dockerClientStub.returns({
            container: {
                list: () => Promise.resolve(dummyRawDockerContainers)
            }
        })
    })


    afterEach(function () {
        if (dockerClientStub)
            dockerClientStub.restore()

        if (tasksMock)
            tasksMock.restore()

        if (getSelectedEventContainerIdAndServiceStub)
            getSelectedEventContainerIdAndServiceStub.restore()
    })

    it(`should throw error on invalid requestBody (requestBody = '${invalidRequestBody}')`, function () {
        let containerInfoDummy: ContainerInfo

        tasksMock.expects('TaskDeterminer').withExactArgs(invalidRequestBody, containerInfoDummy).threw()
        Tasks.TaskDeterminer(invalidRequestBody, containerInfoDummy)

        tasksMock.verify()
    })

    it(`should call fetchContainerInfo from ContainerInfo object at least once`, async function () {
        const fetchContainerSpy = sinon.spy(containerInfoSpy, 'fetchContainerInfo')
        await Tasks.TaskDeterminer(numbersAddRequestBody, containerInfoSpy)

        expect(fetchContainerSpy.calledOnce).to.be.true
    })

    it(`should call fetchEventContainer from ContainerInfo object at least once`, async function () {
        const fetchEventContainerSpy = sinon.spy(containerInfoSpy, 'fetchEventContainer')
        // Lesson, always await for functions returning promises
        await Tasks.TaskDeterminer(numbersAddRequestBody, containerInfoSpy)
        expect(fetchEventContainerSpy.calledOnce).to.be.true
    })

    it(`should return object with TaskInterface on valid inputs`, async function () {
        const parsedTask = await Tasks.TaskDeterminer(numbersAddRequestBody, containerInfoSpy)

        expect(parsedTask).to.haveOwnProperty('serviceContainerId')
    })

})

describe(`tasks -> waitForResult`, function () {
    const dummyResponseArrivalTime: number = 10

    it(`should return result when response returns after ${dummyResponseArrivalTime} ms`, async function () {
        const dummyRequestId: string = 'id1'
        const dummyResponse: ReceivedEventInterface = {
            service: '',
            containerId: '',
            requestId: dummyRequestId,
            responseBody: 'dummyResponseBody'
        }

        await setTimeout(() => {
            Util.pushResponseToBuffers(dummyResponse)
        }, dummyResponseArrivalTime)

        const returnedResponseBody = await Tasks.waitForResult(dummyRequestId)

        expect(returnedResponseBody).to.be.equal(dummyResponse.responseBody)

        Util.clearResponseFromBuffers(dummyResponse)
    })

})


// Integrated test here
describe(`tasks -> TaskController`, function () {
    // TaskDeterminer called with arguments
    // sendTaskToEventsService called with args
    // Wait for result is called with args
    // Returns expected response

    // TaskController stub
    // TaskDeterminer stub
    // sendTaskToEventService stub
    // waitForResult stub

    let TaskControllerStub: sinon.SinonStub
    let TaskDeterminerStub: sinon.SinonStub
    let sendTaskToEventServiceStub: sinon.SinonStub
    let waitForResultStub: sinon.SinonStub

    const dummyContainerInfoObject = new ContainerInfo()
    const dummyRequestBody = '{ a1: 3, a2: 4}'

    const dummyRequestId: string = 'id1'

    const dummyTask: TaskInterface = {
        task: 'NUMBER',
        subtask: 'ADD',
        containerId: '',
        service: '',
        requestId: dummyRequestId,
        requestBody: '',
        serviceContainerId: '',
        serviceContainerService: ''
    }

    const dummyResponse: ReceivedEventInterface = {
        service: '',
        containerId: '',
        requestId: dummyRequestId,
        responseBody: 'dummyResponseBody'
    }

    beforeEach(async function () {
        Util.pushResponseToBuffers(dummyResponse)

        TaskControllerStub = sinon.stub(Tasks, 'TaskController')

        TaskDeterminerStub = sinon.stub(Tasks, 'TaskDeterminer')
        TaskDeterminerStub.resolves(dummyTask)

        sendTaskToEventServiceStub = sinon.stub(Tasks, 'sendTaskToEventsService')

        waitForResultStub = sinon.stub(Tasks, 'waitForResult')
        waitForResultStub.resolves(dummyResponse.requestBody)

        await Tasks.TaskController(dummyRequestBody, dummyContainerInfoObject)
    })

    afterEach(function () {
        if (TaskControllerStub)
            TaskControllerStub.restore()

        if (TaskDeterminerStub)
            TaskDeterminerStub.restore()

        if (sendTaskToEventServiceStub)
            sendTaskToEventServiceStub.restore()

        if (waitForResultStub)
            waitForResultStub.restore()

        Util.clearResponseFromBuffers(dummyResponse)
    })

    it(`should be called at least once with requestBody: ${dummyRequestBody}`, function () {
        expect(TaskControllerStub.calledOnce).to.be.true
        expect(TaskControllerStub.calledWithExactly(dummyRequestBody, dummyContainerInfoObject)).to.be.true
    })

    // it(`should call TaskDeterminer with requestBody and dummyContainerInfoObject`, async function () {
    //     expect(TaskDeterminerStub.calledOnce).to.be.true
    // })

})