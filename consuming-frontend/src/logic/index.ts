import { ContainerInfo } from "../docker-api";

import { ReceivedEventInterface, EventTaskType, ContainerInfoInterface } from "../interfaces";
import { logStatusFileMessage } from "../log";
import { redisPublisher } from "../initialise/redis";
import { EventService } from './../env/index'
import { pushResponseToBuffers } from "../util";

export function EventDeterminer(sentEvent: string, functionContainerInfo: ContainerInfo): void {
    let event: ReceivedEventInterface = JSON.parse(sentEvent)

    if (typeof event === 'string') {
        event = JSON.parse(event)
    }

    const offlineContainerInfo: ContainerInfoInterface = functionContainerInfo.fetchOfflineContainerInfo();
    const eventIsOurs = event.containerId === offlineContainerInfo.id &&
        event.service === offlineContainerInfo.service

    const taskType: EventTaskType = event.responseBody ? 'RESPONSE' :
        event.requestBody ? 'TASK' :
            null

    /*
      This makes frontend service containers *taskable
      -- taskable - means that they can receive tasks, perform tasks and send back to
        event services
    */
    if (!eventIsOurs)
        return

    switch (taskType) {
        case 'TASK':
            // Frontend not meant to receive any tasks
            break;
        case 'RESPONSE':
            /* 
              Event pushed to response buffers is waited on using 'requestId' as identifier
              - Use this function to wait for result, http and even Web Sockets
              as in tasks/index.ts -> TaskController function

              const response = await waitForResult(task.requestId)
            */
            pushResponseToBuffers(event)
            break;
    }
}

