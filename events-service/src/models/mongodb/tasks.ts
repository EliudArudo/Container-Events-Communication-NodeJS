import { Schema, model } from "mongoose"


const TaskSchema = new Schema({
    fromContainerId: String,
    fromContainerService: String,
    fromReceivedTime: Date,
    task: String,
    subtask: String,
    requestBodyId: String,
    toContainerId: String,
    toContainerService: String,
    serviceContainerId: String,
    serviceContainerService: String,

    toReceivedTime: String,
    toResponseBodyId: String,
    fromSentTime: String
})

export const MongoDBTask = model('task', TaskSchema)