import * as sinon from 'sinon'
import * as chai from 'chai'

import * as Logic from '../../logic'

import { ReceivedEventInterface, ContainerInfoInterface } from '../../interfaces'
import { ContainerInfo } from '../../docker-api'

const expect = chai.expect

describe(`logic -> performLogic`, function () {
    const dummyContainerId = "containerId"
    const dummyContainerService = "consumingfrontend"

    const dummyStringAddRequestBody = "{ \"a1\": \"a\", \"a2\": \"b\"}"
    const dummyNumberAddRequestBody = "{ \"a1\": 4, \"a2\": 5 }"
    const dummyNumberSubtractRequestBody = "{ \"s1\": 4, \"s2\": 5 }"
    const dummyNumberMultiplyRequestBody = "{ \"m1\": 4, \"m2\": 5 }"
    const dummyNumberDivideRequestBody = "{ \"d1\": 4, \"d2\": 2}"

    const expectedStringAddResult = "ab"
    const expectedNumberAddResult = 9
    const expectedNumberSubtractResult = -1
    const expectedNumberMultiplyResult = 20
    const expectedNumberDivideResult = 2


    const fakeContainerInfo: ContainerInfoInterface = {
        id: dummyContainerId,
        service: dummyContainerService
    }

    const dummyEvent: ReceivedEventInterface = {
        containerId: dummyContainerId,
        service: dummyContainerService
    }

    let containerInfoStub: sinon.SinonStub

    beforeEach(function () {

        containerInfoStub = sinon.stub(ContainerInfo.prototype, 'fetchOfflineContainerInfo')
        containerInfoStub.returns(fakeContainerInfo)
    })

    afterEach(function () {
        if (containerInfoStub)
            containerInfoStub.restore()
    })

    it(`should return '${expectedStringAddResult}' when requestBody: ${dummyStringAddRequestBody}`, function () {
        dummyEvent.task = "STRING"
        dummyEvent.subtask = "ADD"
        dummyEvent.requestBody = dummyStringAddRequestBody

        const result = Logic.performLogic(dummyEvent)

        expect(result).to.equal(expectedStringAddResult)
    })

    it(`should return '${expectedNumberAddResult}' when requestBody: ${dummyNumberAddRequestBody}`, function () {
        dummyEvent.task = "NUMBER"
        dummyEvent.subtask = "ADD"
        dummyEvent.requestBody = dummyNumberAddRequestBody

        const result = Logic.performLogic(dummyEvent)

        expect(result).to.equal(expectedNumberAddResult)
    })

    it(`should return '${expectedNumberSubtractResult}' when requestBody: ${dummyNumberDivideRequestBody}`, function () {
        dummyEvent.task = "NUMBER"
        dummyEvent.subtask = "SUBTRACT"
        dummyEvent.requestBody = dummyNumberSubtractRequestBody

        const result = Logic.performLogic(dummyEvent)

        expect(result).to.equal(expectedNumberSubtractResult)
    })

    it(`should return '${expectedNumberMultiplyResult}' when requestBody: ${dummyNumberMultiplyRequestBody}`, function () {
        dummyEvent.task = "NUMBER"
        dummyEvent.subtask = "MULTIPLY"
        dummyEvent.requestBody = dummyNumberMultiplyRequestBody

        const result = Logic.performLogic(dummyEvent)

        expect(result).to.equal(expectedNumberMultiplyResult)
    })

    it(`should return '${expectedNumberDivideResult}' when requestBody: ${dummyNumberDivideRequestBody}`, function () {
        dummyEvent.task = "NUMBER"
        dummyEvent.subtask = "DIVIDE"
        dummyEvent.requestBody = dummyNumberDivideRequestBody

        const result = Logic.performLogic(dummyEvent)

        expect(result).to.equal(expectedNumberDivideResult)
    })

})
