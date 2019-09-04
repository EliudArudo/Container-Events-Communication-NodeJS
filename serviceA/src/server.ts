import { ContainerInfo, ContainerInfoInterface } from "./docker-api"

const containerInfo = new ContainerInfo()

containerInfo.fetchContainerInfo()
    .then((info: ContainerInfoInterface) => {
        console.log(info)
    })
    .catch(e => console.log(e))


// Container info on success should contain 'id' and 'service'




