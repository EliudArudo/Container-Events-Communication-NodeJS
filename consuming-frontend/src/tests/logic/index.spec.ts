import * as sinon from 'sinon'
import * as chai from 'chai'

import * as Logic from '../../logic'
import * as Util from '../../util'

import { ReceivedEventInterface, ContainerInfoInterface } from '../../interfaces'
import { ContainerInfo } from '../../docker-api'

const expect = chai.expect

describe(`logic -> EventDeterminer`, function () {
    const dummyContainerId = "containerId"
    const dummyContainerService = "consumingfrontend"
    const dummyRequestId = "requestId"

    const fakeContainerInfo: ContainerInfoInterface = {
        id: dummyContainerId,
        service: dummyContainerService
    }

    const dummyEvent: ReceivedEventInterface = {
        containerId: dummyContainerId,
        service: dummyContainerService,
        requestId: dummyRequestId,
        responseBody: 'dummyResponseBody'
    }

    const jsonEvent: string = JSON.stringify(dummyEvent)

    const containerInfo = new ContainerInfo()

    let containerInfoStub: sinon.SinonStub
    let responseMock: sinon.SinonMock

    beforeEach(function () {

        containerInfoStub = sinon.stub(ContainerInfo.prototype, 'fetchOfflineContainerInfo')
        containerInfoStub.returns(fakeContainerInfo)

        responseMock = sinon.mock(Util.responses)
    })

    afterEach(function () {
        if (containerInfoStub)
            containerInfoStub.restore()

        if (responseMock)
            responseMock.restore()

        Util.clearResponseFromBuffers(dummyEvent)
    })

    it(`should push event as response to buffers if ours`, function () {
        responseMock.expects('push').calledWithExactly(dummyRequestId)

        Logic.EventDeterminer(jsonEvent, containerInfo)

        responseMock.verify()
    })

    it(`should not push event if it's not ours`, function () {

        const wrongEvent: ReceivedEventInterface = { ...dummyEvent }
        wrongEvent.containerId = 'wrong_container_id'

        const jsonWrongEvent: string = JSON.stringify(wrongEvent)

        Logic.EventDeterminer(jsonWrongEvent, containerInfo)

        expect(Util.responses.length).to.equal(0)
    })
})