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

const setup = require('../lib/setupTest').setup;
const assert = require('chai').assert;
const samplecart = require('../resources/sample-cart');
const samplecartNoAddress = require('../resources/sample-cart-no-address');
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;
const specsBuilder = require('../lib/config').specsBuilder;
const httpStatusCodes = require('http-status-codes');
const utils = require('../lib/utils');
/**
 * Describes the unit tests for Magento post shipping method operation.
 */
describe('Magento postShippingMethod', () => {

    describe('Unit Tests', () => {

        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'postShippingMethod');

        //initialize the address helper
        const addressTests = require('../lib/addressUTHelper').tests(this);

        it('returns an error for a missing expected parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns an error for updating a cart if cart id is missing', () => {
            return this.execute()
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message, "Parameter 'id' is missing.");
                });
        });

        it('returns an error for updating a cart with invalid shipping method format', () => {
            return this.execute(Object.assign({ 'id': '12345-7', 'shippingMethodId': '1234' }, config))
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.message, "Invalid value '1234' for property 'shippingMethodId'. Must match /^(\\w+?)_(\\w+?)$/");
                });
        });

        it('returns an error for updating a cart without an shipping address', () => {
            return this.prepareReject(samplecartNoAddress)
                .execute(Object.assign({ 'id': '12345-7', 'shippingMethodId': 'flatrate_flatrate' }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                });
        });

        specsBuilder('shippingMethodId', 'flatrate_flatrate').forEach(spec => {
            it(`successfully returns a ${spec.name} cart after the shipping method was added`, () => {

                let body = {
                    addressInformation: {
                        shipping_address: addressTests.testMagentoAddress(),
                        shipping_method_code: 'flatrate',
                        shipping_carrier_code: 'flatrate'
                    }
                };
                let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/shipping-information`),
                    'POST', spec.token);
                postRequestWithBody.body = body;

                const expectedArgs = [
                    postRequestWithBody,
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                return this.prepareResolve(samplecart, expectedArgs)
                    .execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isUndefined(result.response.error, JSON.stringify(result.response.error));
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 200);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.shippingAddress);
                    });
            });
        });

        specsBuilder('shippingMethodId', 'flatrate_flatrate').forEach(spec => {
            it(`successfully returns 404 when a  ${spec.name} cart has no shipping address set`, () => {

                let body = {
                    addressInformation: {
                        shipping_address: addressTests.testMagentoAddress(),
                        shipping_method_code: 'flatrate',
                        shipping_carrier_code: 'flatrate'
                    }
                };
                let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/shipping-information`),
                    'POST', spec.token);
                postRequestWithBody.body = body;

                const expectedArgs = [
                    postRequestWithBody,
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                let sampleCartNoShippingAddress = utils.clone(samplecart);
                delete sampleCartNoShippingAddress.cart_details.extension_attributes.shipping_assignments;

                return this.prepareResolve(sampleCartNoShippingAddress, expectedArgs)
                    .execute(Object.assign(spec.args, config))
                    .then(res => {
                        assert.isDefined(res.response.error);
                        assert.strictEqual(res.response.error.name, 'CommerceServiceBadRequestError');
                        assert.strictEqual(res.response.error.message, 'Bad Magento Request');
                        assert.strictEqual(res.response.error.cause.statusCode, httpStatusCodes.BAD_REQUEST);
                        assert.strictEqual(res.response.error.cause.message, 'The shipping address is missing. Set the address and try again.');
                    });
            });
        });

    });
});
