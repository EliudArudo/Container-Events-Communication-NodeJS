import * as chai from 'chai'
import * as sinon from 'sinon'

const expect = chai.expect

import {
    indexController,
    _404RouterHandler,
    redisController,
    requestRouteController
} from '../../controllers/index'

import * as logic from './../../logic/index'
import * as tasks from './../../tasks/index'

import { ContainerInfo } from '../../docker-api'

import * as logging from './../../log/index'

// Ensures logStatusFileMessage is not called
// const loggingMock = sinon.stub(logging, 'logStatusFileMessage')


// describe("smoke test", function () {
//     it("checks equality", function () {
//         expect(true).to.be.true
//     })
// })


// describe("controllers -> indexController", function () {
//     it("should return { message : 'OK' }", function () {
//         let req = {}

//         let res = {
//             send: sinon.spy()
//         }

//         indexController(req, res)

//         expect(res.send.calledOnce).to.be.true

//         const jsonReturnMessage = JSON.stringify({ message: 'OK' })
//         const jsonArgument = JSON.stringify(res.send.firstCall.args[0])
//         expect(jsonArgument).to.be.equal(jsonReturnMessage)
//     })
// })


// describe("controllers -> requestRouteController", function () {
//     // Using stubs for test doubles
//     let TaskControllerStub: sinon.SinonStub
//     let res: any
//     let req: any

//     beforeEach(function () {
//         TaskControllerStub = sinon.stub(tasks, 'TaskController')

//         req = {
//             body: '{ "a1": 5, "a2": 10}'
//         }

//         res = {
//             send: sinon.spy()
//         }
//     })

//     afterEach(function () {
//         if (TaskControllerStub)
//             TaskControllerStub.restore()
//     })

//     it("should call TaskController at least once", async function () {
//         TaskControllerStub.resolves('')

//         res = {
//             status: function () {
//                 return {
//                     send: function () { }
//                 }
//             }
//         }

//         await requestRouteController(req, res)
//         expect(TaskControllerStub.calledOnce).to.be.true

//         TaskControllerStub.restore()
//     })

//     it("should call res.send with result if TaskController threw no error", async function () {
//         TaskControllerStub.resolves('')

//         await requestRouteController(req, res)
//         expect(res.send.calledOnce).to.be.true

//     })

//     it("should receive status of 500 when TaskController throws error", async function () {
//         // TaskControllerStub.rejects('Error')

//         // res = {
//         //     status: function () { }
//         // }

//         // let statusStub = sinon.stub(res, 'status').returns({ send: function () { } })

//         // try {
//         //     await requestRouteController(req, res)
//         // } catch (e) {
//         //     throw (e)
//         // } finally {
//         //     expect(statusStub.calledOnce).to.be.equal(500)

//         // }

//         // // expect(resStatusStub.firstCall.args[0]).to.be.equal(500)
//     })

// })


// describe("controllers -> _404RouterHandler", function () {
//     it("should return status 404", function () {
//         let err = {}
//         let req = {}
//         let res = {
//             status: function () {
//                 return { send: sinon.spy() }
//             }
//         } as any
//         let next = {}

//         const resStatusStub = sinon.stub(res, 'status').returns({ send: function () { } })

//         _404RouterHandler(err, req, res, next)

//         expect(resStatusStub.calledOnce).to.be.true
//         expect(resStatusStub.firstCall.args[0]).to.be.equal(404)
//     })
// })


// describe("controllers -> redisController", function () {
//     // using Spies for test doubles
//     let dummyContainerInfo: ContainerInfo

//     let dummySentEvent: string

//     let EventDeterminerStub: any

//     beforeEach(function () {
//         EventDeterminerStub = sinon.stub(logic, 'EventDeterminer')

//         dummyContainerInfo = {
//             fetchOfflineContainerInfo: function () {
//                 return { id: '' }
//             }
//         } as any

//         dummySentEvent = JSON.stringify({})
//     })

//     afterEach(function () {
//         if (EventDeterminerStub)
//             EventDeterminerStub.restore()
//     })



//     it("should call EventDeterminer at least once", function () {
//         redisController(dummySentEvent, dummyContainerInfo)

//         expect(EventDeterminerStub.calledOnce).to.be.true
//     })

//     it("should throw error from EventDeterminer with wrong JSON sentEvent", async function () {

//         try {
//             redisController('', dummyContainerInfo)
//             expect(EventDeterminerStub).to.throw(Error)
//         } catch (err) {
//             // Do nothing with error right now
//         }

//     })
// })