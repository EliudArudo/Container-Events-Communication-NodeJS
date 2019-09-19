export interface ContainerInfoInterface {
    id: string
    service: string
}

export interface RedisEnvInterface {
    host: string
    port: number
}

export type TASK_TYPE = 'NUMBER' | 'STRING'

export type SUB_TASK_TYPE = 'ADD' | 'MULTIPLY' | 'SUBTRACT' | 'DIVIDE'

export interface TaskInterface {
    task: TASK_TYPE
    subtask: SUB_TASK_TYPE
    containerId: string
    service: string
    requestId: string
    requestBody: string // JSON

    serviceContainerId: string
    serviceContainerService: string
}


export interface ReceivedEventInterface {
    requestId?: string
    containerId: string
    service: string

    // Received user>'this_container'>'event'>'service'>'event'>'this_container'
    responseBody?: string // JSON

    // Received 'event'>'this_container'
    recordId?: string
    task?: TASK_TYPE
    subtask?: SUB_TASK_TYPE

    requestBody?: string,

    serviceContainerId?: string,
    serviceContainerService?: string
}

export type EventTaskType = 'TASK' | 'RESPONSE'


export type STATUS_TYPE = 'Success' | 'Failure'
