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

function initialiseServer(): void {
    logStatusFileMessage(
        'Success',
        FILENAME,
        'initialiseServer',
        `Express app running on port ${ExpressPort}`
    )
}
app.use(bodyParser.json())

app.get('/', indexController)
app.post('/task', requestRouteController)

app.all('*', function (_) {
    throw new Error('Non existent route and method') // Express will catch this on its own.
})

app.use(_404RouterHandler)

app.listen(ExpressPort, initialiseServer)
