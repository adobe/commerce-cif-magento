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
const samplecart = require('../resources/sample-cart');
const samplecartentry = require('../resources/sample-cart-entry');
const samplecart404 = require('../resources/sample-cart-404');
const samplecartempty = require('../resources/sample-cart-empty');
const sampleInternalServerError = require('../resources/sample-internal-server-error');
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;
const specsBuilder = require('../lib/config').specsBuilder;
/**
 * Describes the unit tests for Magento put cart entry operation.
 */
describe('Magento putCartEntry', () => {

    describe('Unit Tests', () => {

        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'putCartEntry');

        it('fails while updating a cart entry if no parameters are provided', () => {
            return this.execute({})
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                });
        });

        it('fails while updating a cart entry if cart id is missing', () => {
            return this.execute({ 'cartEntryId': '12345', 'quantity': 0 })
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message, 'Parameter \'id\' is missing.');
                });
        });

        it('fails while updating a cart entry if cart entry id is missing', () => {
            return this.execute({ 'id': '12345', 'quantity': 0 })
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message, 'Parameter \'cartEntryId\' is missing.');
                });
        });

        it('fails while updating a cart entry if quantity is missing', () => {
            return this.execute({ 'id': '12345', 'cartEntryId': '12345' })
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message, 'Parameter \'quantity\' is missing.');
                });
        });

        it('fails while updating a cart entry if quantity is an invalid double value', () => {
            return this.execute({ 'id': '12345', 'cartEntryId': '12345', 'quantity': 2.2 })
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message,
                        'Parameter \'quantity\' must be an integer');
                });
        });

        it('fails while updating a cart entry if quantity is a NAN', () => {
            return this.execute({ 'id': '12345', 'cartEntryId': '12345', 'quantity': 'z' })
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message,
                        'Parameter \'quantity\' must be an integer');
                });
        });

        it('fails while updating a cart entry of a non existing shopping cart', () => {
            return this.prepareReject(samplecart404)
            .execute({
                id: 'not-extisting-cart-id',
                cartEntryId: "999",
                quantity: 3
            })
            .then(result => {
                assert.isDefined(result.response);
                assert.isDefined(result.response.error);
                assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
            });
        });

        specsBuilder().forEach(spec => {
            it(`updates an existing ${spec.name} cart entry with new quantity`, () => {
                spec.args.cartEntryId = 17;
                spec.args.quantity = 2;

                //build the expected requests
                let body = {
                    'cartItem': {
                        'quote_id': spec.args.id,
                        'qty': spec.args.quantity
                    }
                };

                let putRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/items/${spec.args.cartEntryId}`),
                    'PUT', spec.token);
                putRequestWithBody.body = body;

                const expectedArgs = [
                    putRequestWithBody,
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                //build the responses
                let mockedResponses = [];
                mockedResponses.push(samplecartentry);
                mockedResponses.push(samplecart);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.statusCode);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isNotEmpty(result.response.body.entries);
                    });
            });
        });

        specsBuilder().forEach(spec => {
            it(`deletes successfully an existing ${spec.name} cart entry when quantity is 0`, () => {
                spec.args.cartEntryId = 17;
                spec.args.quantity = 0;

                const expectedArgs = [
                    requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/items/${spec.args.cartEntryId}`), 'DELETE',
                        spec.token),
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                let mockedResponses = [];
                mockedResponses.push('true');
                mockedResponses.push(samplecartempty);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 200);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                    });

            });
        });

        specsBuilder().forEach(spec => {
            it(`returns correct error when deleting an existing ${spec.name} cart entry when quantity is 0`, () => {
                spec.args.cartEntryId = 17;
                spec.args.quantity = 0;

                const expectedArgs = [
                    requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/items/${spec.args.cartEntryId}`), 'DELETE',
                        spec.token),
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                let mockedResponses = [];
                mockedResponses.push('true');
                mockedResponses.push(Promise.reject(sampleInternalServerError));

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.strictEqual(result.response.error.name, 'UnexpectedError');
                        assert.strictEqual(result.response.error.message, 'Unknown error while communicating with Magento');
                        assert.strictEqual(result.response.error.cause.statusCode, sampleInternalServerError.statusCode);
                        assert.strictEqual(result.response.error.cause.message, sampleInternalServerError.message);
                    });

            });
        });

    });
});
