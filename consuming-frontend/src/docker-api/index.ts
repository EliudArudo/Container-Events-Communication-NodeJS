import * as os from 'os'
import { Docker } from 'node-docker-api'
import { ContainerInfoInterface } from '../interfaces'
import { logStatusFileMessage } from '../log'
import { getSelectedEventContainerIdAndService } from '../util'

const FILENAME = 'src/docker-api/index'

export class ContainerInfo {

    private id: string
    private service: string

    constructor() { }


    public async fetchContainerInfo(): Promise<ContainerInfoInterface> {
        try {
            await this.initialise()

            const id = this.id,
                service = this.service;

            const containerInfo: ContainerInfoInterface = {
                id, service
            }

            return containerInfo
        } catch (e) {
            // throw new Error(e)
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'fetchContainerInfo',
                `failed to fetch container info`)
        }
    }

    public fetchOfflineContainerInfo(): ContainerInfoInterface {
        const id = this.id,
            service = this.service;

        const containerInfo: ContainerInfoInterface = {
            id, service
        }

        return containerInfo
    }


    public async fetchEventContainer(): Promise<ContainerInfoInterface> {
        try {

            const selectedEventContainer: ContainerInfoInterface = await getSelectedEventContainerIdAndService()

            return selectedEventContainer

        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'initialise',
                `failed to initialise`)
        }
    }


    public async getFreshContainers(): Promise<Array<ContainerInfoInterface>> {
        try {
            const containerArray = await this.getDockerContainerList()

            if (!containerArray)
                throw new Error('getFreshContainers: No containers to parse')

            const parsedContainers: Array<ContainerInfoInterface> = this.getParsedContainers(containerArray)

            return parsedContainers

        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'getFreshContainers',
                `failed to fetch fresh container arrays`)
        }
    }


    private async initialise(): Promise<void> {
        try {
            const containerArray = await this.getDockerContainerList()
            this.setContainerInfoUsingContainerArray(containerArray)

        } catch (e) {
            // throw new Error(e)
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'initialise',
                `failed to initialise`)
        }
    }

    private async getDockerContainerList(): Promise<Array<any>> {
        try {
            const docker = new Docker({ socketPath: '/var/run/docker.sock' })

            const containerArray: Array<any> = await docker.container.list()

            return containerArray
        } catch (e) {
            // throw new Error(e)
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'getDockerContainerList',
                `failed to get fresh container list`)
        }
    }

    private setContainerInfoUsingContainerArray(containerArray: Array<any>): void {
        try {
            const shortContainerId = os.hostname()

            if (!containerArray)
                throw new Error('No containers available')

            const fetchedContainer = containerArray.find(container =>
                container.data.Id.includes(shortContainerId)
            )

            const id = fetchedContainer.data.Id,
                service = fetchedContainer.data.Labels['com.docker.swarm.service.name'];

            this.id = id
            this.service = service

        } catch (e) {
            // throw new Error(e)
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'setContainerInfoUsingContainerArray',
                `failed to update info based on container array`)
        }
    }

    private getParsedContainers(containerArray): Array<ContainerInfoInterface> {
        let parsedContainers: Array<ContainerInfoInterface> = []
        if (!containerArray || !Array.isArray(containerArray) || (Array.isArray(containerArray) && containerArray.length === 0))
            throw new Error('getParsedContainers: No containers brought in')

        for (const container of containerArray) {
            const parseContainerInfo: ContainerInfoInterface = {
                id: container.data.Id,
                service: container.data.Labels['com.docker.swarm.service.name']
            }

            parsedContainers.push(parseContainerInfo)
        }

        return parsedContainers
    }

}
