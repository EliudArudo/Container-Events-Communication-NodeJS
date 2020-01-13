import { ReceivedEventInterface } from "../interfaces"
import { ContainerInfoInterface } from '../interfaces';
import { logStatusFileMessage } from '../log';
import { ContainerInfo } from "../docker-api";

export let responseBuffer: Array<string> = []

const FILENAME = 'util/index.ts'
let responses: Array<ReceivedEventInterface> = []

export function pushResponseToBuffers(response: ReceivedEventInterface): void {
    responseBuffer.push(response.requestId)
    responses.push(response)
}

export function clearResponseFromBuffers(response: ReceivedEventInterface): void {
    responseBuffer = responseBuffer.filter(res => res != response.requestId)
    responses = responses.filter(res => JSON.stringify(res) != JSON.stringify(response))
}

export function getResponseFromBuffer(requestId: string): ReceivedEventInterface {
    const responseArrived: boolean = responseBuffer
        .findIndex((res: string) => res === requestId) >= 0

    let response: ReceivedEventInterface
    if (responseArrived) {
        const _response = responses.find(res => res.requestId === requestId)
        response = { ..._response }
        clearResponseFromBuffers(response)
    }

    return response
}

export async function getSelectedEventContainerIdAndService(): Promise<ContainerInfoInterface> {
    try {
        const containerInfo = new ContainerInfo
        const containers: Array<ContainerInfoInterface> = await containerInfo.getFreshContainers()

        const selectedContainers: Array<ContainerInfoInterface> = []

        const selectedService = 'event' //'eventsService' 
        for (const container of containers) {
            const lowerCaseContainerService = container.service.toLowerCase()
            const containerBelongsToSelectedService: boolean =
                lowerCaseContainerService.includes(selectedService)

            if (containerBelongsToSelectedService)
                selectedContainers.push(container)
        }

        const randomlySelectedContainer: ContainerInfoInterface = selectedContainers[Math.floor(Math.random() * selectedContainers.length)];

        const selectedContainer: ContainerInfoInterface = {
            id: randomlySelectedContainer.id,
            service: randomlySelectedContainer.service
        }

        while (!selectedContainer.id) {
            getSelectedEventContainerIdAndService()
        }

        return selectedContainer
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getSelectedContainerIdAndService',
            `failed to getSelectedContainerIdAndService with error:
            ${e}`)
    }
}