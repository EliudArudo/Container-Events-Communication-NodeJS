import * as os from 'os'

import * as sinon from 'sinon'
import * as chai from 'chai'

import { ContainerInfo } from '../../docker-api'
import * as Util from '../../util'

import * as NodeDockerAPI from 'node-docker-api'
import { ContainerInfoInterface } from '../../interfaces'

const expect = chai.expect

// fetchContainerInfo
// - initialise is called
//   - initialise should get containerInfo and set id and service already
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

const dummySelectedEventContainer: ContainerInfoInterface = {
    id: 'dummyEventContainerId',
    service: 'dummyEventContainerService'
}


describe(`docker-api -> fetchContainerInfo`, function () {
    const containerInfo = new ContainerInfo()
    let dockerStub: sinon.SinonStub

    beforeEach(() => {
        dockerStub = sinon.stub(NodeDockerAPI, 'Docker')
        dockerStub.returns({
            container: {
                list: () => Promise.resolve(dummyRawDockerContainers)
            }
        })
    })

    afterEach(() => {
        if (dockerStub)
            dockerStub.restore()
    })

    it(`should call initialise()`, function () {
        const initializeSpy = sinon.spy(containerInfo, <any>'initialise')

        containerInfo.fetchContainerInfo()

        expect(initializeSpy.calledOnce).to.be.true

        initializeSpy.restore()
        dockerStub.restore()
    })
})

// fetchEventContainer
// - Util.getSelectedEventContainerIdAndService should be called
// - Should return selectedEventContainer when mocked

describe(`docker-api -> fetchContainerInfo`, function () {

    const containerInfo = new ContainerInfo()
    let utilGetSelectedEventContainerIdAndServiceStub: sinon.SinonStub

    beforeEach(function () {
        utilGetSelectedEventContainerIdAndServiceStub = sinon.stub(Util, 'getSelectedEventContainerIdAndService')
        utilGetSelectedEventContainerIdAndServiceStub.resolves(dummySelectedEventContainer)
    })

    afterEach(function () {
        if (utilGetSelectedEventContainerIdAndServiceStub)
            utilGetSelectedEventContainerIdAndServiceStub.restore()
    })


    it(`should call Util -> getSelectedEventContainerIdAndService()`, async function () {
        await containerInfo.fetchEventContainer()

        expect(utilGetSelectedEventContainerIdAndServiceStub.calledOnce).to.be.true
        // Make sure to restore all stubs!!!
    })

    it(`should return dummySelectedEventContainer`, async function () {
        const selectedEventContainer = await containerInfo.fetchEventContainer()

        expect(selectedEventContainer).to.equal(dummySelectedEventContainer)
    })
})

// getFreshContainers
// - getDockerContainerList is called
//   - Mock and return empty containerArray list
//     - Should return error
// - On returning dummy containers, parsedContainers should be valid
// - Should return parsed containers
//   - Mocks should return what they're supposed to return

// initialise
// - getDockerContainerList should be called
// - setContainerInfoUsingContainerArray should be called
//   - have to Mock getDockerContainerList and return containerArray
//   - have to Mock os and return dummy hostname

// getDockerContainerList
// - should call on docker.container.list()
// - should return valid containerArray
//   - mock docker container list

// setContainerInfoUsingContainerArray
// - should throw error if containerArray is non existent
// - should correctly set id and service on dummy data
//   - call fetchOfflineContainerInfo to ensure this

// getParsedContainers
// - should throw if container array is invalid
// - should correctly  parse containers to id and service

