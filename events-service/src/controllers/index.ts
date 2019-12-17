import { EventDeterminer } from "../logic"

/*
  Test
   - EventDeterminer called at least once
*/
export function redisController(sentEvent: string): void {
    EventDeterminer(sentEvent)
}