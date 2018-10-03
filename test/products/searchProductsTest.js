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
const config = require('../lib/config').config;
const sinon = require('sinon');
const sampleProductSearch = require('../resources/sample-product-search');

describe('magento searchProducts', () => {

    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'searchProducts');

        let consoleSpy;

        before(() => {
            consoleSpy = sinon.spy(console, 'log');
        });

        after(() => {
            consoleSpy.restore();
        });

        it('performs a product search with fulltext search', () => {
            return this.prepareResolve(sampleProductSearch, (actualsArgs) => {
                    assert.equal(actualsArgs.method, "POST");
                    assert.isTrue(actualsArgs.resolveWithFullResponse, true);
                    assert.equal(actualsArgs.uri, `http://${config.MAGENTO_HOST}/graphql`);
                    assert.isDefined(actualsArgs.body.query);
                    assert.isDefined(actualsArgs.body.operationName);
                    assert.isDefined(actualsArgs.body.variables);
                })
                .execute(Object.assign({
                    'text': 'shirt',
                    'MAGENTO_SCHEMA': 'http'
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                });
        });

        it('performs a profiled product search in debug mode', () => {
            return this.prepareResolve(sampleProductSearch)
                .execute(Object.assign({
                    'text': 'shirt',
                    'MAGENTO_SCHEMA': 'http',
                    'DEBUG': true
                }, config))
                .then(result => {
                    assert.isTrue(consoleSpy.withArgs('BACKEND-CALL').calledOnce);
                    assert.isDefined(result.response.body);
                    
                });
        });

        it('returns an error for a missing expected parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns an error for a failed backend request', () => {
            return this.prepareReject(undefined)
                .execute(Object.assign({
                    'filter': 'variants.sku:"meskwielt"',
                    'MAGENTO_SCHEMA': 'http'
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                });
        });

        it('returns an error for invalid search parameters', () => {
            return this.execute({
                'filter': 'categories.id:subtree:14|variants.sku:abc|categories.id:42'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
            });
        });

    });

});