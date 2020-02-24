
import * as sinon from 'sinon'
import * as chai from 'chai'

import * as Util from '../../util'
import { ReceivedEventInterface, ContainerInfoInterface } from '../../interfaces'
import { ContainerInfo } from '../../docker-api'

import * as NodeDockerAPI from 'node-docker-api'

const expect = chai.expect

const dummyResponse: ReceivedEventInterface = {
    service: '',
    containerId: '',
    requestId: 'dummyResponseId',
    responseBody: ''
}



const dummyRawDockerContainers = [
    {
        data: {
            Id: 'container-1',
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


const dummyContainers: Array<ContainerInfoInterface> = [
    {
        id: 'containerId1',
        service: 'eventservice'
    },
    {
        id: 'containerId2',
        service: 'consumingservice'
    }
]


let responseMock: sinon.SinonMock
let responseBufferMock: sinon.SinonMock

describe(`util -> pushResponseToBuffers`, function () {

    beforeEach(function () {
        responseMock = sinon.mock(Util.responses)
        responseBufferMock = sinon.mock(Util.responseBuffer)
    })

    afterEach(function () {
        if (responseMock)
            responseMock.restore()

        if (responseBufferMock)
            responseBufferMock.restore()

        Util.clearResponseFromBuffers(dummyResponse)
    })

    it(`should push to responses array`, function () {
        responseMock.expects('push').calledWithExactly(dummyResponse.requestId)

        Util.pushResponseToBuffers(dummyResponse)

        responseMock.verify()
    })

    it(`should push to responseBuffer array`, function () {
        responseBufferMock.expects('push').calledWithExactly(dummyResponse)

        Util.pushResponseToBuffers(dummyResponse)

        responseBufferMock.verify()
    })
})

// "test-watch": "mocha --watch --watch-extensions ts --require ts-node/register src/tests/**/*.spec.ts"


describe(`util -> getResponseFromBuffer`, function () {
    let clearResponseFromBufferStub: sinon.SinonStub

    beforeEach(function () {
        Util.pushResponseToBuffers(dummyResponse)

        clearResponseFromBufferStub = sinon.stub(Util, 'clearResponseFromBuffers')
    })

    afterEach(function () {
        if (clearResponseFromBufferStub)
            clearResponseFromBufferStub.restore()

        Util.clearResponseFromBuffers(dummyResponse)
    })

    it(`should return dummyResponse just sent in`, function () {

        const response = Util.getResponseFromBuffer(dummyResponse.requestId)

        expect(JSON.stringify(response)).to.equal(JSON.stringify(dummyResponse))
    })
})


describe(`util -> getSelectedEventContainerIdAndService`, function () {
    let containerInfoStub: sinon.SinonStub
    let DockerStub: sinon.SinonStub


    beforeEach(function () {
        DockerStub = sinon.stub(NodeDockerAPI, 'Docker').returns({
            container: {
                list: () => Promise.resolve(dummyRawDockerContainers)
            }
        })

        // IMPORTANT - stubbing an entire class so that objects have specified methods!!
        containerInfoStub = sinon.stub(ContainerInfo.prototype, 'getFreshContainers')
        containerInfoStub.resolves(dummyContainers)
    })

    afterEach(function () {
        if (containerInfoStub)
            containerInfoStub.restore()

        if (DockerStub)
            DockerStub.restore()
    })

    it(`should return event container`, async function () {
        const eventContainer = await Util.getSelectedEventContainerIdAndService()

        expect(JSON.stringify(eventContainer)).to.equal(JSON.stringify(dummyContainers[0]))
    })
})




