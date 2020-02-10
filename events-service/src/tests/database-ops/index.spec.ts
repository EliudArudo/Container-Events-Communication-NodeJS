import * as chai from 'chai'

import * as DatabaseOPS from '../../database-ops'
import { EventInterface } from '../../interfaces'

/* 
   MongoDB requests can be mocked but avoiding that because it's hard to mock database calls using go
*/

const expect = chai.expect

describe('database-ops -> getParsedResponse', function () {

    it(`should correctly parse response using found task and response document`, function () {
        const dummyOldTask: any = {
            fromRequestId: 'dummyFromRequestId',
            fromContainerId: 'dummyFromContainerId',
            fromContainerService: 'dummyFromContainerService'
        }

        const dummyResponse: any = {
            responseBody: 'dummyResponseBody'
        }

        const response: EventInterface = DatabaseOPS.getParsedResponse(dummyResponse, dummyOldTask)

        expect(response.requestId).to.equal(dummyOldTask.fromRequestId)
        expect(response.containerId).to.equal(dummyOldTask.fromContainerId)
        expect(response.service).to.equal(dummyOldTask.fromContainerService)
        expect(response.responseBody).to.equal(dummyResponse.responseBody)

    })

})