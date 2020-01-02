import * as os from 'os'
import { Docker } from 'node-docker-api'
import { logStatusFileMessage } from '../log'
import { ContainerInfoInterface, ParsedContainerInterface } from '../interfaces'

const FILENAME = 'src/docker-api/index'


export class DockerAPI {

    private static id: string
    private static service: string

    constructor() { }

    private static async initialise(): Promise<void> {
        try {
            const infoWasAlreadyInitialised = this.id && this.service
            if (infoWasAlreadyInitialised)
                return

            const containerArray = await this.getDockerContainerList()
            if (!containerArray)
                throw new Error('initialise: Cannot retrieve container array')

            this.setContainerInfoUsingContainerArray(containerArray)
        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'initialise',
                `failed initialise`)
        }
    }

    public static async fetchContainerInfo(): Promise<ContainerInfoInterface> {
        try {
            await this.initialise()

            const id = this.id,
                service = this.service;

            const containerInfo: ContainerInfoInterface = {
                id, service
            }

            return containerInfo
        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'fetchContainerInfo',
                `failed to fetch container Info`)
        }
    }

    public static fetchOfflineContainerInfo(): ContainerInfoInterface {
        const id = this.id,
            service = this.service;

        const containerInfo: ContainerInfoInterface = {
            id, service
        }

        return containerInfo
    }

    public static async getFreshContainers(): Promise<Array<ParsedContainerInterface>> {
        try {
            const containerArray = await this.getDockerContainerList()

            if (!containerArray)
                throw new Error('getFreshContainers: No containers to parse')

            const parsedContainers: Array<ParsedContainerInterface> = this.getParsedContainers(containerArray)

            return parsedContainers

        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'getFreshContainers',
                `failed to fetch fresh container arrays`)
        }
    }

    private static async getDockerContainerList(): Promise<Array<any>> {
        try {
            const docker = new Docker({ socketPath: '/var/run/docker.sock' })

            const containerArray: Array<any> = await docker.container.list()

            return containerArray
        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'getDockerContainerList',
                `failed to fetch containers from Docker`)
        }
    }

    private static getParsedContainers(containerArray): Array<ParsedContainerInterface> {
        let parsedContainers: Array<ParsedContainerInterface> = []
        if (!containerArray || !Array.isArray(containerArray) || (Array.isArray(containerArray) && containerArray.length === 0))
            throw new Error('getParsedContainers: No containers brought in')

        for (const container of containerArray) {
            const parseContainerInfo: ParsedContainerInterface = {
                containerID: container.data.Id,
                containerService: container.data.Labels['com.docker.swarm.service.name']
            }

            parsedContainers.push(parseContainerInfo)
        }

        return parsedContainers
    }


    private static setContainerInfoUsingContainerArray(containerArray: Array<any>): void {
        try {
            const shortContainerId = os.hostname()

            if (!containerArray)
                throw new Error('setContainerInfoUsingContainerArray : no containersArray to set')

            const fetchedContainer = containerArray.find(container =>
                container.data.Id.includes(shortContainerId)
            )

            const id = fetchedContainer.data.Id,
                service = fetchedContainer.data.Labels['com.docker.swarm.service.name'];

            this.id = id
            this.service = service

        } catch (e) {
            logStatusFileMessage(
                'Failure',
                FILENAME,
                'setContainerInfoUsingContainerArray',
                `failed get containersArray to set`)
        }
    }
}
