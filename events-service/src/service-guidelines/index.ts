/*
All services have a
  -- Tasks file (task and subtask)
    * task type with Magic Strings
    * subtask type with Magic Strings
  -- Could make tasks file a github file to be downloadable


*** This service receives and sends Tasks from consuming services***
- Tasks received and sent Only through Redis pubsub

- On container start, initialise the ContainerInfo Object
  which we use the containerInfo for subsequent requests
  (We use this for mentioning the container that served the event)

- Initialisation of containerInfo is after express-'app.listen'
  or redis.subscribe

- On anyone sending a task to it,
  it classifies the task according to the defined tasks file
  and finds the corresponding service which it's supposed through
  send it to

- New task received with info
  {
    containerId,
    service,
    task,
    subtask,
    requestBody
  }
  * requestBody is in JSON format

- adds a new record with fields
  -> from_container_id,
     from_container_service,
     received_time,
     task,
     sub_task,
     request_body_id,
     to_container_id,
     to_service,
     served_by_container_id,
     served_by_service


    (body_id is the id of new document saved in request-body-collection)
    (to_service  is found from checking tasks and which services handle them)
    (to_container_id is found from getting container lists and containers belonging to service, and picking one of the containers)
    (served_by_container_id is the id of the serving event service container)
    (served_by_service is the service of the serving event service container)
    ---- check to make sure 'from_container_service, task, sub_task, and requestBody don't match' -----
    If these fields match, don't send it to consuming service, return it
    to the asking service immediately (Caching through MongoDB)
    --- Solution -> send a 'ping' request through the redis pubsub and the response should be 'pong'

- Sends a request to the chosen container containing
    -> recordId (from storing new document)
    -> task
    -> sub_task
    -> request_body
    -> containerId,
    -> service,
    -> served_by_container_id
    -> served_by_service

- Listens for finished tasks come in with response
  {
    recordId ,
    containerId,
    served_by_container_id,
    served_by_service,
    service,
    task,
    subtask,
    responseBody
  }
  * responseBody is in JSON format

 - On getting response, it takes it and locates the recordid, then fills in the
   -> to_received_time
      to_response_body_id
      to_sent_time
      (to_response_body_id is what it gets when it saves the response in the responses collection
      and gets the id)
      (to_sent_time is the time before it sends the response to the consuming service)

- On message being send back, it contains
  {
    containerId,
    service,
    responseBody
  }
  * responseBody is in JSON format
  -> Consuming service should check whether 'containerId' and 'service'
    matches it's container Info before consuming event

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