import { Schema, model } from "mongoose"

const ResponseSchema = new Schema({
    response: String // JSON
})

export const MongoDBResponse = model('response', ResponseSchema)