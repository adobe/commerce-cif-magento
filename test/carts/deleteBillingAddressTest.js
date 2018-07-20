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
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;

/**
 * Describes the unit tests for Magento put cart entry operation.
 */
describe('Magento deleteBillingAddress', () => {

    describe('Unit Tests', () => {

        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'deleteBillingAddress');

        //initialize the address helper
        const addressTests = require('../lib/addressUTHelper').tests(this);

        it('fails while updating a cart if cart id is missing', () => {
            return addressTests.missingCartId();
        });

        it('successfully returns a cart after the billing address was deleted', () => {
            const args = {
                id: '12345-7'
            };
            let body = {
                "address": {}
            };
    
            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/billing-address`), 'POST');
            postRequestWithBody.body = body;
    
            const expectedArgs = [
                postRequestWithBody,
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/${args.id}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET')
            ];
    
            let sampleCartNoAddress = JSON.parse(JSON.stringify(samplecart.cart_details));
            delete sampleCartNoAddress['billing_address'];
    
            return this.prepareResolve(sampleCartNoAddress, expectedArgs)
                .execute(Object.assign(args,config))
                .then(result => {
                    assert.isUndefined(result.response.error, JSON.stringify(result.response.error));
                    assert.isDefined(result.response);
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body);
                    assert.isUndefined(result.response.body['billingAddress'],
                        'Expected undefined result.response.body[billingAddress]');
                });
        });
    });
});

