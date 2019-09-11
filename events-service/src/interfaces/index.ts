export interface ContainerInfoInterface {
    id: string,
    service: string
}

export interface RedisEnvInterface {
    host: string,
    port: number
}

export interface MongoDBEnvInterface {
    uri: string,
    port: string,
    database: string
}

// Find a way to place these in JSON
export type TASK_TYPE = 'NUMBER' | 'STRING'

export type SUB_TASK_TYPE = 'ADD' | 'MULTIPLY' | 'SUBTRACT' | 'DIVIDE'
// Find a way to place these in JSON

export interface TaskInterface {
    task: TASK_TYPE,
    subtask: SUB_TASK_TYPE,
    containerId: string,
    service: string,
    requestBody: string // JSON
}


export interface EventInterface {
    containerId: string,
    service: string,

    // Received user>'this_container'>'event'>'service'>'event'>'this_container'
    responseBody?: string // JSON

    // Received 'event'>'this_container'
    recordId?: string,
    task?: TASK_TYPE,
    subtask?: SUB_TASK_TYPE,
    serviceContainerId?: string,
    serviceContainerService?: string
    requestBody?: string
}

export type EventTaskType = 'TASK' | 'RESPONSE'


export type STATUS_TYPE = 'Success' | 'Failure'


export interface InitialisedRecordInfoInterface {
    containerId: string,
    containerService: string,
    recordId: string,
    task: TASK_TYPE,
    subtask: SUB_TASK_TYPE,
    requestBody?: string, // JSON,
    serviceContainerId: string,
    serviceContainerService: string

    existing?: boolean
    responseBody?: string,
    chosenContainerId?: string,
    chosenContainerService?: string
}

export interface MongoDBTaskSchemaInterface {
    fromContainerId: string,
    fromContainerService: string,
    fromReceivedTime: Date,
    task: TASK_TYPE,
    subtask: SUB_TASK_TYPE,
    requestBodyId: string,
    toContainerId: string,
    toContainerService: string,
    serviceContainerId: string,
    serviceContainerService: string,

    toReceivedTime?: string,
    toResponseBodyId?: string,
    fromSentTime?: string
}


export interface ContainerInfoInterface {
    id: string,
    service: string
}

export interface ParsedContainerInterface {
    containerID: string,
    containerService: string
}