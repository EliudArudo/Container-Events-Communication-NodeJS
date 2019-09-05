import * as Redis from "redis"
import { RedisClient } from "redis"
import { RedisKeys, EventService } from "../env"
import { redisController } from "../controllers"

const { host, port } = RedisKeys
const redisClient = Redis.createClient({
    host,
    port,
    retry_strategy: () => 1000
})

const redisListener: RedisClient = redisClient.duplicate()

redisListener.subscribe(EventService)
redisListener.on('message', (_, event) => {
    redisController(event)
})

export const redisPublisher: RedisClient = redisClient.duplicate()
