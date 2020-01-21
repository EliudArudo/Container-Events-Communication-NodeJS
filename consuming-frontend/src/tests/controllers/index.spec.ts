import * as sinon from 'sinon'
import * as chai from 'chai'

import * as Controllers from '../../controllers'

const expect = chai.expect

describe(`controllers -> indexController`, function () {

    it(`should respond with { message: 'OK'}`, function () {
        const response = { message: 'OK' }

        const req: any = {}
        const res = {
            send: sinon.spy()
        }

        Controllers.indexController(req, res)

        expect(res.send.calledWithExactly(response)).to.be.true
    })

})


describe(`controllers -> _404RouterHandler`, function () {
    // Come back for this

})