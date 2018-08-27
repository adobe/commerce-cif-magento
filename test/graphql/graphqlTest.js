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

const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const setup = require('../lib/setupTest').setup;
const config = require('../lib/config').config;

const {
    allFieldsQuery,
    introSpectionQuery,
    syntaxError,
    invalidField,
    emptyText
} = require('../resources/queries');
const sampleProductSearch = require('../resources/sample-product-search');
const introspectionResponse = require('../resources/sample-introspection-response');

describe('Unit tests', () => {

    describe('graphql', () => {

        setup(this, __dirname, 'graphql');
    
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
                    'MAGENTO_SCHEMA': 'http',
                    __ow_method: 'post',
                    query: allFieldsQuery,
                    MAGENTO_SIMPLEFIELDS: [],
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    assert.isDefined(result.response.body.data);
                });
        });

        it('performs schema introspection', () => {
            return this.prepareResolve(introspectionResponse, (actualsArgs) => {
                    assert.equal(actualsArgs.method, "POST");
                    assert.isTrue(actualsArgs.resolveWithFullResponse, true);
                    assert.equal(actualsArgs.uri, `http://${config.MAGENTO_HOST}/graphql`);
                    assert.isDefined(actualsArgs.body.query);
                    assert.isDefined(actualsArgs.body.operationName);
                    assert.isDefined(actualsArgs.body.variables);
                })
                .execute(Object.assign({
                    'MAGENTO_SCHEMA': 'http',
                    __ow_method: 'post',
                    query: introSpectionQuery,
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    assert.isDefined(result.response.body.data);
                });
        });

        it('returns an error body for syntax error query', () => {
            return this.execute({
                query: syntaxError
            }).then(result => {
                assert.isDefined(result.response.body);
                assert.isDefined(result.response.body.errors);
            });
        });

        it('returns an error body for invalid field query', () => {
            return this.execute({
                query: invalidField
            }).then(result => {
                assert.isDefined(result.response.body);
                assert.isDefined(result.response.body.errors);
            });
        });

        it('returns an error body for a missing search or filter parameter', () => {
            this.execute({
                query: emptyText,
                MAGENTO_SIMPLEFIELDS: []
            }).then(result => {
                assert.isDefined(result.response.body);
                assert.isDefined(result.response.body.errors);
            });
        });


    });
});