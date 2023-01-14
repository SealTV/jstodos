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

describe('Sum', function() {
    describe('1 + 1 = 2', function() {
        it('should return 2 from sum of 1 + 1', function() {
            assert.equal(sum(1, 1), 2);
        })
    })
})