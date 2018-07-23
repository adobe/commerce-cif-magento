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
const requestConfig = require('../lib/config').requestConfig;
const customerResponseMock = require('../resources/sample-customer');
const sampleCustomerLogin401 = require('../resources/sample-customer-login-401');

/**
 * Describes the unit tests for magento customer login operation.
 */
describe('Magento postCustomerLogin', () => {
    
    describe('Unit Tests', () => {
        
        let customerToken = 'qwtuyr382svfjt7l5abufyuxqsp4sknv';
        setup(this, __dirname, 'postCustomerLogin');

        it('performs customer login and returns customer data', () => { 
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;
            
            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken
            ];
            
            let mockedResponses = [customerToken, customerResponseMock];
            
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password'
                    })
                ).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body.customer);
                    assert.isDefined(result.response.headers['Set-Cookie']);
                    assert.isTrue(result.response.headers['Set-Cookie'].includes(customerToken));
                });
        });

        it('returns proper error message with a failed login', () => {
            let args = {
                email: 'a@a.com',
                password: 'bad password'
            };
            return this.prepareReject(sampleCustomerLogin401).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'CommerceServiceUnauthorizedError');
                assert.strictEqual(result.response.error.message, 'Unauthorized Request');
            });
        });
    });
});
