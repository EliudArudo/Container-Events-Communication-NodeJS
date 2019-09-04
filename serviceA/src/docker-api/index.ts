import * as os from 'os'
import { Docker } from 'node-docker-api'

export interface ContainerInfoInterface {
    id: string,
    service: string
}

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
            throw new Error(e)
        }
    }

    private async initialise(): Promise<void> {
        try {
            const containerArray = await this.getDockerContainerList()
            this.setContainerInfoUsingContainerArray(containerArray)

        } catch (e) {
            throw new Error(e)
        }
    }

    private async getDockerContainerList(): Promise<Array<any>> {
        try {
            const docker = new Docker({ socketPath: '/var/run/docker.sock' })

            const containerArray: Array<any> = await docker.container.list()

            return containerArray
        } catch (e) {
            throw new Error(e)
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
            throw new Error(e)
        }
    }
}
