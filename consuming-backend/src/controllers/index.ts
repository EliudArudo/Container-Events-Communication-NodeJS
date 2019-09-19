import { ContainerInfo } from "../docker-api"
import { EventDeterminer } from "../logic"

export function redisController(sentEvent: string, functionContainerInfo: ContainerInfo): void {
    EventDeterminer(sentEvent, functionContainerInfo)
}