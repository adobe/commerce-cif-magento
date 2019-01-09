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

describe('Magento postCustomerAuth', () => {
    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'postCustomerAuth');

        it('returns a not implemented error for guest authentication', () => {
            return this.execute({
                type: 'guest'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'NotImplementedError');
            });
        });

        it('successful authentication with credentials', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            
            const expectedArgs = [
                postRequestWithBody
            ];

            let token = 'abcd';
            return this.prepareResolve(token, expectedArgs)
                .execute({
                    type: 'credentials',
                    email: 'a@a.com',
                    password: 'password'
                }).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.strictEqual(result.response.body.access_token, token);
                    assert.strictEqual(result.response.body.token_type, 'bearer');
                });
        });

        it('returns invalid argument error for bad type parameter', () => {
            return this.execute({
                type: 'test'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
            });
        });

        it('returns missing property error for missing email parameter', () => {
            return this.execute({
                type: 'credentials',
                password: '1234'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns missing property error for missing password parameter', () => {
            return this.execute({
                type: 'credentials',
                email: 'a@a.com'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });
    });
});