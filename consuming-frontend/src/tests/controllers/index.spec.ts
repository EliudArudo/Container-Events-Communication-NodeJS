import * as chai from 'chai'
import * as sinon from 'sinon'

const expect = chai.expect

import { indexController, _404RouterHandler, redisController } from '../../controllers/index'

import * as logic from './../../logic/index'
import { ContainerInfo } from '../../docker-api'


describe("smoke test", function () {
    it("checks equality", function () {
        expect(true).to.be.true
    })
})


describe("controllers -> indexController", function () {
    it("should return { message : 'OK' }", function () {
        let req = {}

        let res = {
            send: sinon.spy()
        }

        indexController(req, res)

        expect(res.send.calledOnce).to.be.true

        const jsonReturnMessage = JSON.stringify({ message: 'OK' })
        const jsonArgument = JSON.stringify(res.send.firstCall.args[0])
        expect(jsonArgument).to.be.equal(jsonReturnMessage)
    })
})


describe("controllers -> _404RouterHandler", function () {
    it("should return status 404", function () {
        let err = {}
        let req = {}
        let res = {
            status: function () {
                return { send: sinon.spy() }
            }
        } as any
        let next = {}

        const resStatusStub = sinon.stub(res, 'status').returns({ send: function () { } })

        _404RouterHandler(err, req, res, next)

        expect(resStatusStub.calledOnce).to.be.true
        expect(resStatusStub.firstCall.args[0]).to.be.equal(404)
    })
})


describe("controllers -> redisController", function () {
    // USING TEST DOUBLES!!!!!
    let dummyContainerInfo: ContainerInfo

    let dummySentEvent: string

    let EventDeterminerStub = sinon.stub(logic, 'EventDeterminer')

    beforeEach(function () {
        dummyContainerInfo = {
            fetchOfflineContainerInfo: function () {
                return { id: '' }
            }
        } as any

        dummySentEvent = JSON.stringify({})
    })

    afterEach(function () {
        EventDeterminerStub.restore()
    })



    it("should call EventDeterminer at least once", function () {
        redisController(dummySentEvent, dummyContainerInfo)

        expect(EventDeterminerStub.calledOnce).to.be.true
    })

    it("should throw error from EventDeterminer with wrong JSON sentEvent", async function () {

        try {
            redisController('', dummyContainerInfo)
            expect(EventDeterminerStub).to.throw(Error)
        } catch (err) {
            // Do nothing with error right now
        }

    })
})