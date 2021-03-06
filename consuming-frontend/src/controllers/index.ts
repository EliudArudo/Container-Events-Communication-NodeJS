import { TaskController } from "../tasks"
import { containerInfo } from "../initialise/docker-api"
import { ContainerInfo } from "../docker-api"
import { EventDeterminer } from "../logic"

const FILENAME = "controllers/index.ts"


export function indexController(req: any, res: any): void {
    res.send({ message: 'OK' })
}


export function requestRouteController(req: any, res: any): void {
    TaskController(req.body, containerInfo)
        .then((result: any) => {
            res.send({ message: 'OK', result })
        })
        .catch(e => {
            res.status(500).send({ message: 'Server error' })
        })
}


export function _404RouterHandler(err: any, req: any, res: any, next: any) {
    res.status(404).send({ message: err.message })
}


export function redisController(sentEvent: string, functionContainerInfo: ContainerInfo): void {
    EventDeterminer(sentEvent, functionContainerInfo)
}