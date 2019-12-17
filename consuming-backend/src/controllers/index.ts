import { ContainerInfo } from "../docker-api"
import { EventDeterminer } from "../logic"

/*
  Test
   - EventDeterminer called at least once
*/
export function redisController(sentEvent: string, functionContainerInfo: ContainerInfo): void {
    EventDeterminer(sentEvent, functionContainerInfo)
}