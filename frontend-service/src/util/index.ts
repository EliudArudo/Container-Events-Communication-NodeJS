import { ReceivedEventInterface } from "../interfaces"

export let responseBuffer: Array<string> = []

let responses: Array<ReceivedEventInterface> = []

export function pushResponseToBuffers(response: ReceivedEventInterface): void {
    responseBuffer.push(response.requestId)
    responses.push(response)
}

function clearResponseFromBuffers(response: ReceivedEventInterface): void {
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