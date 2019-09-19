import { RedisEnvInterface } from "../interfaces"

export const RedisKeys: RedisEnvInterface = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
}

export const ExpressPort: number = Number(process.env.PORT) || 4000

export const EventService: string = process.env.EVENT_SERVICE_EVENT || 'Event_Service'

export const ConsumingService = process.env.CONSUMING_SERVICE_EVENT || 'Consuming_Service'


/*
 REDIS_HOST
 REDIS_PORT
 PORT
 EVENT_SERVICE_EVENT
 CONSUMING_SERVICE_EVENT
*/