import * as Redis from "redis"
import { RedisClient } from "redis"
import { RedisKeys, ConsumingService } from "../env"
import { redisController } from "../controllers"
import { containerInfo } from './docker-api'

const { host, port } = RedisKeys
const redisClient = Redis.createClient({
    host,
    port,
    retry_strategy: () => 1000
})

const redisListener: RedisClient = redisClient.duplicate()

redisListener.subscribe(ConsumingService)
redisListener.on('message', (_, event) => {
    redisController(event, containerInfo)
})

export const redisPublisher: RedisClient = redisClient.duplicate()
