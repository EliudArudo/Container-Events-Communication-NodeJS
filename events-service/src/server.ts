import { DockerAPI, ContainerInfoInterface, ParsedContainerInterface } from "./docker-api";

async function log(): Promise<void> {
    try {
        const myContainerInfo: ContainerInfoInterface = await DockerAPI.fetchContainerInfo()
        const freshContainers: Array<ParsedContainerInterface> = await DockerAPI.getFreshContainers()

        console.log({
            myContainerInfo,
            freshContainers
        })

    } catch (e) {
        console.log('log: ', e)
    }
}

DockerAPI.initialise()
    .then(log)
    .catch(e => {
        // No need because it's already thrown in function
    })


