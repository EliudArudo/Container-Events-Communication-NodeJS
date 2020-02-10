import * as os from 'os'

import * as sinon from 'sinon'
import * as chai from 'chai'

import { DockerAPI } from '../../docker-api'

import * as NodeDockerAPI from 'node-docker-api'
import { ContainerInfoInterface, ParsedContainerInterface } from '../../interfaces'

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


describe(`docker-api -> initialise`, function () {
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

    it(`should set id and service according to found container`, async function () {
        await DockerAPI.initialise()

        const containerInfo: ContainerInfoInterface = DockerAPI.fetchOfflineContainerInfo()

        expect(containerInfo.id).to.equal(dummyRawDockerContainers[0].data.Id)
        expect(containerInfo.service).to.equal(dummyRawDockerContainers[0].data.Labels["com.docker.swarm.service.name"])
    })
})

describe(`docker-api -> fetchContainerInfo`, function () {
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
        const initializeSpy = sinon.spy(DockerAPI, <any>'initialise')

        DockerAPI.fetchContainerInfo()

        expect(initializeSpy.calledOnce).to.be.true

        initializeSpy.restore()
        dockerStub.restore()
    })
})



describe(`docker-api -> getParsedContainers`, function () {
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

    it(`should throw if there are no containers to parse`, function () {
        const containerArray = []

        expect(
            function () { DockerAPI.getParsedContainers(containerArray) }
        ).to.throw
    })

    it(`should return parsed containers on fetching docker containers`, async function () {
        const containerArray = await DockerAPI.getDockerContainerList()

        const parsedContainers: Array<ParsedContainerInterface> = DockerAPI.getParsedContainers(containerArray)

        expect(parsedContainers[1].containerService).to.equal(containerArray[0].data.Labels["com.docker.swarm.service.name"])
    })
})


