import { RedisEnvInterface, MongoDBEnvInterface } from "../interfaces"

export const RedisKeys: RedisEnvInterface = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
}

export const MongoDBKeys: MongoDBEnvInterface = {
    uri: process.env.MONGOURI,
    port: process.env.MONGOPORT,
    database: process.env.MONGODATABASE
}

export const EventService: string = process.env.EVENT_SERVICE || 'Event_Service'

export const ConsumingService = process.env.CONSUMING_SERVICE || 'Consuming_Service'