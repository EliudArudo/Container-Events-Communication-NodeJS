const os = require('os')

const { Docker } = require('node-docker-api')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const shortContainerId = os.hostname()
let containerInfo = {
    id: null,
    service: null
}

let fullContainerId


function getMyContainerInfoFromContainerArray(containerArray) {
    const containerInfoFetched = {
        id: null,
        service: null
    }

    if (!containerArray || !Array.isArray(containerArray))
        return containerInfoFetched

    const fetchedContainer = containerArray.find(container =>
        container.data.Id.includes(shortContainerId)
    )

    containerInfoFetched.id = fetchedContainer.data.Id
    containerInfoFetched.service = fetchedContainer.data.Labels['com.docker.swarm.service.name']

    return containerInfoFetched
}


async function getAndSetMyContainerId() {
    try {

        const containerArray = await docker.container.list()

        containerInfo = getMyContainerInfoFromContainerArray(containerArray)

        console.log(`My container info: `, containerInfo)

        fullContainerId = containerInfo.id

    } catch (e) {
        console.log(e)
    }
}

getAndSetMyContainerId()



