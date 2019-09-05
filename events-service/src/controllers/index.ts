import { EventDeterminer } from "../logic"

export function redisController(sentEvent: string): void {
    EventDeterminer(sentEvent)
}