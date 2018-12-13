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
const errorData = require('../resources/sample-graphql-errors');
const config = require('../lib/config').config;
const sinon = require('sinon');

describe('magento getProductById', () => {

    describe('Unit tests', () => {

        // build the helper in the context of '.this' suite
        setup(this, __dirname, 'getProductById');

        let consoleSpy;
        let sampleProductSearch;
        let productWithVariants;

        before(() => {
            consoleSpy = sinon.spy(console, 'log');
        });

        beforeEach(() => {
            sampleProductSearch = JSON.parse(JSON.stringify(testData.simpleProductResponse));
            productWithVariants = JSON.parse(JSON.stringify(testData.productWithVariantsResponse));
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
                    'id': 'someId'
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
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
                    'id': 'testSimpleProduct',
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    const product = result.response.body;
                    assert.strictEqual(product.name, 'Test Simple Product');
                    assert.strictEqual(product.id, 'testSimpleProduct');
                    assert.strictEqual(product.sku, 'testSimpleProduct');
                    assert.strictEqual(product.prices[0].amount, 2200);
                });
        });

        it('returns stock information for a product variant', () => {
            return this.prepareResolve(productWithVariants, (actualsArgs) => {
                assert.equal(actualsArgs.method, "POST");
                assert.isTrue(actualsArgs.resolveWithFullResponse, true);
                assert.equal(actualsArgs.uri, `http://${config.MAGENTO_HOST}/graphql`);
                assert.isDefined(actualsArgs.body.query);
                assert.isDefined(actualsArgs.body.operationName);
                assert.isDefined(actualsArgs.body.variables);
            })
                .execute(Object.assign({
                    'id': 'testConfigProduct',
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    const product = result.response.body;
                    assert.strictEqual(product.variants[0].available, true);
                });
        });

        it('returns stock information for a product', () => {
            return this.prepareResolve(sampleProductSearch, (actualsArgs) => {
                assert.equal(actualsArgs.method, "POST");
                assert.isTrue(actualsArgs.resolveWithFullResponse, true);
                assert.equal(actualsArgs.uri, `http://${config.MAGENTO_HOST}/graphql`);
                assert.isDefined(actualsArgs.body.query);
                assert.isDefined(actualsArgs.body.operationName);
                assert.isDefined(actualsArgs.body.variables);
            })
                .execute(Object.assign({
                    'id': 'testSimpleProduct',
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    const product = result.response.body;
                    assert.strictEqual(product.variants[0].available, false);
                });
        })

        it('returns 404 for a product which does not exist', () => {
            sampleProductSearch.body.data.products.items = [];
            return this.prepareResolve(sampleProductSearch)
                .execute(Object.assign({
                    'id': 'testSimpleProduct',
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError')
                });
        });

        it('performs a profiled product get in debug mode', () => {
            return this.prepareResolve(sampleProductSearch)
                .execute(Object.assign({
                    'id': 'testSimpleProduct',
                    'DEBUG': true
                }, config))
                .then(result => {
                    assert.isTrue(consoleSpy.withArgs('BACKEND-CALL').calledOnce);
                    assert.isDefined(result.response.body); 
                });
        });

        it('forwards graphQL error messages in CIF responses', () => {
            return this.prepareResolve(errorData)
                .execute(Object.assign({
                    'id': 'testSimpleProduct'
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
                    assert.strictEqual(result.response.error.message, 'Cannot query field "whatever" on type "ProductInterface". | Cannot query field "whatever" on type "SimpleProduct".');
                });
        });
    });
});