import * as Redis from "redis"
import { RedisClient } from "redis"
import { RedisKeys, ConsumingService } from "../env"
import { redisController } from "../controllers"
import { containerInfo, initialFetchMyContainerInfo } from './docker-api'
import { logStatusFileMessage } from "../log"

const FILENAME = "initialise/redis.ts"

const { host, port } = RedisKeys
const redisClient = Redis.createClient({
    host,
    port,
    retry_strategy: () => 1000
})

redisClient.on('error', (err) => {
    logStatusFileMessage('Failure', FILENAME, 'redisClient.on error', `Redis failed to start up with error:
    ${err}`)
    process.exit(1)
})

redisClient.on('ready', () => {
    logStatusFileMessage('Success', FILENAME, 'redisClient.on ready', 'Redis succesfully running')
    initialFetchMyContainerInfo()
})



const redisListener: RedisClient = redisClient.duplicate()

redisListener.on('message', (_, event) => {
    redisController(event, containerInfo)
})
redisListener.subscribe(ConsumingService)

export const redisPublisher: RedisClient = redisClient.duplicate()
