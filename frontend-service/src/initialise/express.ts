// Express app code
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { ExpressPort } from '../env'
import { containerInfo } from './docker-api'
import { indexController, requestRouteController, _404RouterHandler } from '../controllers'
import { ContainerInfoInterface } from '../interfaces'
import { logStatusFileMessage } from '../log'
const app = express()

const FILENAME = 'express.ts'

async function initialiseServer(): Promise<void> {
    try {
        logStatusFileMessage(
            'Success',
            FILENAME,
            'initialiseServer',
            `Express app running on port ${ExpressPort}`
        )

        const myContainerInfo: ContainerInfoInterface
            = await containerInfo.fetchContainerInfo()

        if (!(myContainerInfo.id && myContainerInfo.service))
            throw new Error('Container info non existent')

        logStatusFileMessage(
            'Success',
            FILENAME,
            'initialiseServer',
            `myContainerInfo ${myContainerInfo}`
        )
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'initialiseServer',
            `${e.message}`)
    }
}
app.use(bodyParser.json())

app.get('/', indexController)
app.post('/task', requestRouteController)

app.all('*', function (_) {
    throw new Error('Non existent route and method') // Express will catch this on its own.
})

app.use(_404RouterHandler)

app.listen(ExpressPort, initialiseServer)
