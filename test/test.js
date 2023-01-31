'use strict';

import { strict as assert } from 'node:assert';

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});

function sum(a, b) {
    return a + b
}

describe('Sum', function () {
    describe('1 + 1 = 2', function () {
        it('should return 2 from sum of 1 + 1', function () {
            assert.equal(sum(1, 1), 2);
        })
    })
})

/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    const s = new Set(nums); return s.size !== nums.length
};

describe('containsDuplicate', function () {
    describe('[1,2,3,1] = true', function () {
        it('should return true', function () {
            let nums = [1, 2, 3, 1];
            assert.equal(containsDuplicate(nums), true);
        })
    })


    describe('[1,2,3,4] = false', function () {
        it('should return false', function () {
            let nums = [1, 2, 3, 4];
            assert.equal(containsDuplicate(nums), false);
        })
    })
})


describe('destruction', function () {
    let user = {
        name: "John",
        years: 30
    };

    let { name, years: age, isAdmin = false } = user;
    it ('should be equal to "John"', ()=> assert.equal(name, "John"));
    it ('should be equal to 30', ()=> assert.equal(age, 30));
    it ('should be equal to FALSE', ()=> assert.equal(isAdmin, false));
})
