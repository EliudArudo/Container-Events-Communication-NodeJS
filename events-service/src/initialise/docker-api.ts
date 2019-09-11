import { DockerAPI } from "../docker-api"
import { ContainerInfoInterface } from "../interfaces"
import { logStatusFileMessage } from "../log"

const FILENAME = "/initialise/docker-api.ts"

export async function initialFetchMyContainerInfo(): Promise<void> {
    try {
        const myContainerInfo: ContainerInfoInterface = await DockerAPI.fetchContainerInfo()

        logStatusFileMessage(
            'Success',
            FILENAME,
            'initialiseServer',
            `myContainerInfo:
            id: ${myContainerInfo.id},
            service: ${myContainerInfo.service}
            `)

    } catch (e) {
        logStatusFileMessage('Failure', FILENAME, 'getMyContainerInfo', `Failed to get my container info with error:
        err ${e}`)
    }
}



