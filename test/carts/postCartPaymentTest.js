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
const payment400 = require('../resources/payment-400');
const samplecart = require('../resources/sample-cart');
const requestConfig = require('../lib/config').requestConfig;

describe('Magento postCartPayment', () => {
    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'postCartPayment');

        it('returns an error for a missing expected parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns an error for an invalid payment method', () => {
            return this.prepareReject(payment400)
                .execute(Object.assign({
                    'id': 'dummy-1',
                    'payment': { "method": "play-money" }
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                });
        });

        it('returns a cart with a payment method', () => {
            let args = {
                id: 'dummy-id',
                payment: {
                    "method": "creditcard"
                }
            };

            let postCartPaymentRequest = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/selected-payment-method`), 'PUT');
            postCartPaymentRequest.body = {
                method: { 
                    method: 'creditcard'
                }
            };

            const expectedArgs = [
                postCartPaymentRequest,
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/${args.id}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET')
            ];

            return this.prepareResolveMultipleResponse(["0", samplecart], expectedArgs)
                .execute(Object.assign(args, config))
                .then(result => {
                    assert.isDefined(result.response);
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body);
                    assert.strictEqual(result.response.body.id, args.id);

                    // Check payment in cart
                    let cart = result.response.body;
                    assert.isDefined(cart.payment);
                    assert.isDefined(cart.payment.method);
                    assert.isDefined(cart.payment.method);
                    assert.equal(cart.payment.method, "checkmo");
                    assert.equal(cart.payment.methodId, "checkmo");
                    assert.isDefined(cart.payments);
                    assert.isArray(cart.payments);
                    assert.lengthOf(cart.payments, 1);
                    assert.equal(cart.payments[0].method, "checkmo");
                    assert.equal(cart.payments[0].methodId, "checkmo");
                });

        });

    });
});