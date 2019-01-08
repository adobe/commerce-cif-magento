/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
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
                email: 'john.doe@whatever.com'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });
    });
});