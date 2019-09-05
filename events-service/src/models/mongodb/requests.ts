import { Schema, model } from "mongoose"

const RequestsSchema = new Schema({
    request: String // JSON
})

export const MongoDBRequest = model('requests', RequestsSchema)