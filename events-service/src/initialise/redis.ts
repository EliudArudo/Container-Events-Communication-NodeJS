import * as Redis from "redis"
import { RedisClient } from "redis"
import { RedisKeys, EventService } from "../env"
import { redisController } from "../controllers"
import { logStatusFileMessage } from "../log"
import { initialFetchMyContainerInfo } from "./docker-api"

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
    redisController(event)
})
redisListener.subscribe(EventService)

export const redisPublisher: RedisClient = redisClient.duplicate()
