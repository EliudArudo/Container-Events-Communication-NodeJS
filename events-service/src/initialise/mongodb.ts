import * as mongoose from "mongoose"
import { MongoDBKeys } from "../env"
import { logStatusFileMessage } from "../log"

const FILENAME = "initialise/mongodb.ts"

const {
    uri,
    port,
    database
} = MongoDBKeys

const mongoURI =
    `mongodb://${uri}:${port}/${database}`

require("mongoose").Promise = global.Promise

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    reconnectTries: 100,
    reconnectInterval: 1000
})
    .then(_ => {
        logStatusFileMessage(
            'Success',
            FILENAME,
            'mongoose.connect',
            `connected successfully`)
    })
    .catch(err => {
        console.log(err)
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'mongoose.connect',
            `failed connect to mongodb database`)

        process.exit(1)
    })
