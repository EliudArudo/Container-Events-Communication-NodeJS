import * as os from 'os'

import * as sinon from 'sinon'
import * as chai from 'chai'

import { ContainerInfo } from '../../docker-api'

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
    // const containerInfo = new ContainerInfo()
    // let dockerStub: sinon.SinonStub

    // beforeEach(() => {
    //     dockerStub = sinon.stub(NodeDockerAPI, 'Docker')
    //     dockerStub.returns({
    //         container: {
    //             list: () => Promise.resolve(dummyRawDockerContainers)
    //         }
    //     })
    // })

    // afterEach(() => {
    //     if (dockerStub)
    //         dockerStub.restore()
    // })

    // it(`should call initialise()`, function () {
    //     const initializeSpy = sinon.spy(containerInfo, <any>'initialise')

    //     containerInfo.fetchContainerInfo()

    //     expect(initializeSpy.calledOnce).to.be.true

    //     initializeSpy.restore()
    //     dockerStub.restore()
    // })
})

