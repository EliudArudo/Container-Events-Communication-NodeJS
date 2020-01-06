import * as chai from 'chai'
import * as sinon from 'sinon'

import { DetermineTask, DetermineSubTask, TaskDeterminer } from '../../tasks/index'

import { TASK_TYPE, SUB_TASK_TYPE } from '../../interfaces/index'

const expect = chai.expect
const assert = chai.assert

const numbersAddRequestBody = { a1: 3, a2: 4 }
const stringRequestBody = { s1: 'a', s2: 'b' }
const erroneousStringRequestBody = { x1: 'a', x2: 'b' }
const numbersSubtractRequestBody = { s1: 3, s2: 4 }
const numbersMultiplyRequestBody = { m1: 3, m2: 4 }
const numbersDivideRequestBody = { d1: 3, d2: 4 }
const emptyRequestBody = {}

const NUMBER_TASK_TYPE: TASK_TYPE = 'NUMBER'
const STRING_TASK_TYPE: TASK_TYPE = 'STRING'

const ADD_SUB_TASK_TYPE: SUB_TASK_TYPE = 'ADD'
const SUBTRACT_SUB_TASK_TYPE: SUB_TASK_TYPE = 'SUBTRACT'
const MULTIPLY_SUB_TASK_TYPE: SUB_TASK_TYPE = 'MULTIPLY'
const DIVIDE_SUB_TASK_TYPE: SUB_TASK_TYPE = 'DIVIDE'


function jsonifyObject(object: any): string {
    return JSON.stringify(object)
}

describe("tasks -> DetermineTask", function () {
    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE} on requestBody = ${JSON.stringify(numbersAddRequestBody)}`, function () {
        const determinedTask = DetermineTask(numbersAddRequestBody)

        assert.typeOf(determinedTask, 'string')
        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE} on requestBody = ${JSON.stringify(stringRequestBody)}`, function () {
        const determinedTask = DetermineTask(stringRequestBody)

        assert.typeOf(determinedTask, 'string')
        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
    })

    it(`should return null if fields are empty on requestBody = ${JSON.stringify(emptyRequestBody)}`, function () {
        const determinedTask = DetermineTask(emptyRequestBody)

        expect(determinedTask).to.be.null
    })
})

describe("tasks -> DetermineSubTask", function () {

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersAddRequestBody)}`, function () {
        const determinedTask = DetermineTask(numbersAddRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, numbersAddRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${SUBTRACT_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersSubtractRequestBody)}`, function () {
        const determinedTask = DetermineTask(numbersSubtractRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, numbersSubtractRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(SUBTRACT_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${MULTIPLY_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersMultiplyRequestBody)}`, function () {
        const determinedTask = DetermineTask(numbersMultiplyRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, numbersMultiplyRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(MULTIPLY_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${NUMBER_TASK_TYPE}, SUB_TASK_TYPE = ${DIVIDE_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(numbersDivideRequestBody)}`, function () {
        const determinedTask = DetermineTask(numbersDivideRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, numbersDivideRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(NUMBER_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(DIVIDE_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} on requestBody = ${JSON.stringify(stringRequestBody)}`, function () {
        const determinedTask = DetermineTask(stringRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, stringRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })

    it(`should return TASK_TYPE = ${STRING_TASK_TYPE}, SUB_TASK_TYPE = ${ADD_SUB_TASK_TYPE} despite requestBody = ${JSON.stringify(erroneousStringRequestBody)}`, function () {
        const determinedTask = DetermineTask(stringRequestBody)
        const determinedSubTask = DetermineSubTask(determinedTask, erroneousStringRequestBody)

        assert.typeOf(determinedTask, 'string')
        assert.typeOf(determinedSubTask, 'string')

        expect(determinedTask).to.be.equal(STRING_TASK_TYPE)
        expect(determinedSubTask).to.be.equal(ADD_SUB_TASK_TYPE)
    })


    it(`should return undefined SUB_TASK_TYPE if TASK_TYPE is null`, function () {
        const determinedSubTask = DetermineSubTask(null, erroneousStringRequestBody)

        expect(determinedSubTask).to.be.undefined
    })

})


// var chai = require('chai')
// chai.should()
// chai.use(require('chai-interface'))

// var foo = {
//     bar: true,
//     baz: 'green',
//     qux: 37,
//     quack: function () { },
//     ducks: [1, 2, 3]
// }

// foo.should.have.interface({
//     bar: Boolean,
//     baz: String,
//     qux: Number,
//     quack: Function,
//     ducks: Array
// })
