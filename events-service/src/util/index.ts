import { EventInterface, ContainerInfoInterface, ParsedContainerInterface } from '../interfaces';
import { DockerAPI } from '../docker-api';
import { logStatusFileMessage } from '../log';

const TaskMaps = require("../tasks/task-maps.json")

const FILENAME = 'util/index.ts'

export async function getSelectedContainerIdAndService(task: EventInterface): Promise<ContainerInfoInterface> {

    try {
        const containers: Array<ParsedContainerInterface> = await DockerAPI.getFreshContainers()

        const selectedContainers: Array<ParsedContainerInterface> = []

        let selectedService = TaskMaps[task.task]
        for (const container of containers) {
            const lowerCaseContainerService = container.containerService.toLowerCase()
            const containerBelongsToSelectedService: boolean =
                lowerCaseContainerService.includes(selectedService)

            if (containerBelongsToSelectedService)
                selectedContainers.push(container)
        }

        const randomlySelectedContainer: ParsedContainerInterface = selectedContainers[Math.floor(Math.random() * selectedContainers.length)];

        const selectedContainer: ContainerInfoInterface = {
            id: randomlySelectedContainer.containerID,
            service: randomlySelectedContainer.containerService
        }

        while (!selectedContainer.id) {
            getSelectedContainerIdAndService(task)
        }

        return selectedContainer
    } catch (e) {
        logStatusFileMessage(
            'Failure',
            FILENAME,
            'getSelectedContainerIdAndService',
            `failed to getSelectedContainerIdAndService with error:
            ${e}`)
    }

}