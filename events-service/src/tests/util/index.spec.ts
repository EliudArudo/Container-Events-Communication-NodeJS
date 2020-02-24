
import * as sinon from 'sinon'
import * as chai from 'chai'

import * as Util from '../../util'
import { ContainerInfoInterface, TaskInterface, ParsedContainerInterface } from '../../interfaces'
import { DockerAPI } from '../../docker-api'

import * as NodeDockerAPI from 'node-docker-api'

const expect = chai.expect


const dummyRawDockerContainers = [
    {
        data: {
            Id: 'containerId1',
            Labels: {
                'com.docker.swarm.service.name': 'eventservice'
            }
        }
    },
    {
        data: {
            Id: 'containerId2',
            Labels: {
                'com.docker.swarm.service.name': 'consumingbackendservice'
            }
        }
    }
]


const dummyContainers: Array<ParsedContainerInterface> = [
    {
        containerID: 'containerId1',
        containerService: 'eventservice'
    },
    {
        containerID: 'containerId2',
        containerService: 'consumingbackendservice'
    }
]


describe(`util -> getSelectedEventContainerIdAndService`, function () {
    const task: TaskInterface = {
        task: 'NUMBER',
        subtask: 'ADD',
        containerId: '',
        service: 'consumingbackendservice',
        requestBody: ''
    }

    let containerInfoStub: sinon.SinonStub
    let DockerStub: sinon.SinonStub


    beforeEach(function () {
        DockerStub = sinon.stub(NodeDockerAPI, 'Docker').returns({
            container: {
                list: () => Promise.resolve(dummyRawDockerContainers)
            }
        })

        // IMPORTANT - stubbing an entire class so that objects have specified methods!!
        containerInfoStub = sinon.stub(DockerAPI, 'getFreshContainers')
        containerInfoStub.resolves(dummyContainers)
    })

    afterEach(function () {
        if (containerInfoStub)
            containerInfoStub.restore()

        if (DockerStub)
            DockerStub.restore()
    })

    it(`should return backend container based on a when task is ${task.task}`, async function () {
        const fetchedContainer: ContainerInfoInterface = await Util.getSelectedContainerIdAndService(task)

        expect(fetchedContainer.service).to.equal(dummyContainers[1].containerService)
    })
})




