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
const sampleShippingMethods = require('../resources/sample-shippingmethods');
const requestConfig = require('../lib/config').requestConfig;
const config = require('../lib/config').config;
const specsBuilder = require('../lib/config').specsBuilder;

/**
 * Describes the unit tests for Magento get available shipping methods list operation.
 */
describe('Magento getShippingMethods for a cart', () => {

    describe('Unit Tests', () => {

        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'getShippingMethods');

        //validates that the response object is valid
        specsBuilder().forEach(spec => {
            it(`successfully returns a list of shipping methods for a ${spec.name} cart`, () => {

                let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/estimate-shipping-methods`),
                    'POST', spec.token);
                postRequestWithBody.body = {
                    address: samplecart.cart_details.extension_attributes.shipping_assignments[0].shipping.address
                };

                const expectedArgs = [
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token),
                    postRequestWithBody
                ];

                let mockedResponses = [];
                mockedResponses.push(samplecart);
                mockedResponses.push(sampleShippingMethods);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.statusCode);
                        assert.isDefined(result.response.body);
                        assert.isArray(result.response.body);
                        assert.lengthOf(result.response.body, sampleShippingMethods.length);
                    });
            });
        });

        //validates that the response object is valid
        it('successfully returns an empty list of shipping methods for a cart without shipping address', () => {
            let args = {
                id: 'dummy-id'
            };

            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/estimate-shipping-methods`), 'POST');
            postRequestWithBody.body = {
                address: samplecart.cart_details.extension_attributes.shipping_assignments[0].shipping.address
            };
            
            const expectedArgs = [
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/${args.id}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET'),
                postRequestWithBody
            ];

            let mockedResponses = [];
            mockedResponses.push(samplecart);
            mockedResponses.push('[]');
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(args, config))
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.statusCode);
                    assert.isDefined(result.response.body);
                    assert.isArray(result.response.body);
                    assert.lengthOf(result.response.body, 0);
                });
        });

        it('returns unexpected error', () => {
            return this.prepareReject({ 'code': 'UNKNOWN' }).execute({ 'id': 'dummy' }).then(result => {
                assert.strictEqual(result.response.error.name, 'UnexpectedError');
            });
        });

        it('returns invalid argument error', () => {
            return this.deleteArgs().prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
            });
        });

        it('returns missing property error when no cart id is provided', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns unexpected error when the response is invalid', () => {
            return this.prepareReject(undefined).execute({ 'id': 'dummy-1' }).then(result => {
                assert.strictEqual(result.response.error.name, 'UnexpectedError');
            });
        });
    });
});
