/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const assert = require('chai').assert;
const setup = require('../lib/setupTest').setup;
const testData = require('../resources/sample-product-search-single-product');
const config = require('../lib/config').config;
const sinon = require('sinon');

describe('magento getProductBySlug', () => {

    describe('Unit tests', () => {

        // build the helper in the context of '.this' suite
        setup(this, __dirname, 'getProductBySlug');

        let consoleSpy;
        let sampleProductSearch;

        before(() => {
            consoleSpy = sinon.spy(console, 'log');
        });

        beforeEach(() => {
            sampleProductSearch = JSON.parse(JSON.stringify(testData.simpleProductResponse));
        });

        after(() => {
            consoleSpy.restore();
        });

        it('returns an error for a missing expected parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns an error for a failed backend request', () => {
            return this.prepareReject(undefined)
                .execute(Object.assign({
                    'slug': 'someSlug'
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                });
        });

        it('returns an error if id is given instead of slug', () => {
            return this.prepareReject(undefined)
                .execute(Object.assign({
                    'id': 'id'
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                });
        });

        it('returns a product for a valid request', () => {
            return this.prepareResolve(sampleProductSearch, (actualsArgs) => {
                assert.equal(actualsArgs.method, "POST");
                assert.isTrue(actualsArgs.resolveWithFullResponse, true);
                assert.equal(actualsArgs.uri, `http://${config.MAGENTO_HOST}/graphql`);
                assert.isDefined(actualsArgs.body.query);
                assert.isDefined(actualsArgs.body.operationName);
                assert.isDefined(actualsArgs.body.variables);
            })
                .execute(Object.assign({
                    'slug': 'test-simple-product',
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    const product = result.response.body;
                    assert.strictEqual(product.name, 'Test Simple Product');
                    assert.strictEqual(product.id, 'testSimpleProduct');
                    assert.strictEqual(product.sku, 'testSimpleProduct');
                    assert.strictEqual(product.slug, 'test-simple-product');
                    assert.strictEqual(product.prices[0].amount, 2200);
                });
        });
    });
});