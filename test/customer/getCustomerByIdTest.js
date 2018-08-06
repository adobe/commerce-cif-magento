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
const customerResponseMock = require('../resources/sample-customer');
const sampleGetCustomer401 = require('../resources/sample-get-customer-401');

/**
 * Describes the unit tests for magento get customer by id..
 */
describe('Magento getCustomerById', () => {

    describe('Unit Tests', () => {

        setup(this, __dirname, 'getCustomerById');

        const cookieValue = "ccs-magento-customer-token=token";
        const id = 4;

        it('returns user details', () => {
            const expectedArgs = {
                uri: encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`),
                method: 'GET',
                body: undefined,
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json; charset=utf-8',
                    'pragma': 'no-cache',
                    'cache-control': 'no-cache',
                    'authorization': 'Bearer token'
                },
                json: true
            };

            return this.prepareResolve(customerResponseMock, expectedArgs)
                .execute({
                    id: id,
                    __ow_headers: {
                        cookie: cookieValue
                    }
                })
                .then(result => {
                    assert.strictEqual(result.__ow_headers.cookie, cookieValue);
                    assert.strictEqual(result.response.body.id, id);
                    assert.strictEqual(result.response.body.email, "aa@a.com");
                    assert.strictEqual(result.response.body.firstName, "B");
                    assert.strictEqual(result.response.body.lastName, "M");
                });
        });

        it('returns proper error message with wrong credentials', () => {
            let args = {
                id : id,
                __ow_headers: {
                    cookie: 'ccs-magento-customer-token=qwtuyr382svfjt7l5abufyuxqsp4sknv'
                }
            };
            return this.prepareReject(sampleGetCustomer401).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'CommerceServiceUnauthorizedError');
                assert.strictEqual(result.response.error.message, 'Unauthorized Request');
            });
        });

        it('returns proper error message when authentication token is missing', () => {
            let args = {
                id : id
            };
            return this.execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'CommerceServiceForbiddenError');
                assert.strictEqual(result.response.error.message, 'The customer token is missing');
            });
        });

        it('returns proper error message with wrong customer id', () => {
            return this.prepareResolve(customerResponseMock)
                .execute({
                    id: 123,
                    __ow_headers: {
                        cookie: cookieValue
                    }
                })
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'CommerceServiceForbiddenError');
                    assert.strictEqual(result.response.error.message, "The requested customer id doesn't match the provided customer authentication token");
                });
        });
    });
});
