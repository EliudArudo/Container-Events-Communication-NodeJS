/*
All services have a
  -- Tasks file (task and subtask)
    * task type with Magic Strings
    * subtask type with Magic Strings
  -- Could make tasks file a github file to be downloadable


*** This service sends task requests to Events ***
- Requests can be through HTTP or websockets or even Events
  -- Frontend services receive HTTP or Websockets
  -- Backend services  receive Events

* F- frontend, B  - backend

F, B - On container start, initialise the ContainerInfo Object
  which we use the containerInfo for subsequent requests

F, B - On anyone sending a request to it,
  it classifies the task according to the defined tasks file

F, B - Initialisation of containerInfo is after express-'app.listen'
  or redis.subscribe

F - Sending task to Event service with info
  { containerId, service, task, subtask, requestBody }
  * requestBody is in JSON format

B - Sending back finished task to Event service with response
  { recordId ,containerId, service, task, subtask, requestBody, serviceContainerId, serviceContainerService }
  * requestBody is in JSON format

F, B- Subscribed to redis 'events' service

F - On message being returned, it contains
  { containerId, service, responseBody}
  * responseBody is in JSON format
  -> It should check whether 'containerId' and 'service'
    matches it's container Info before consuming event

- Responses
  -- Frontend services send responses through Websockets
  -- Backend services  send responses through Events

- Pubsub info
   - all non Event services
     - listen -> 'consume'
     - publish -> 'event-service'

    - Event services
     - listen -> 'event-service'
     - publish -> 'consume'

     * Event service determines new and sent task using
      -- responseBody or requestBody fields
    (Meaning there must be a response body even in get requests)

*/