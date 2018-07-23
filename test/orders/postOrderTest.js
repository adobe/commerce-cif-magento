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

describe('Magento postOrder', () => {
    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'postOrder');

        it('returns an error for a missing expected parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        it('returns an order', () => {
            let args = {
                cartId: 'dummy-id'
            };
            return this.prepareResolve('"12"', requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.cartId}/order`), 'PUT'))
                .execute(Object.assign(args, config))
                .then(result => {
                    assert.isDefined(result.response);
                    assert.strictEqual(result.response.statusCode, 201);
                    assert.isDefined(result.response.headers);
                    assert.strictEqual(result.response.headers.Location, 'orders/12');
                    assert.isDefined(result.response.body);
                    assert.isObject(result.response.body);
                    assert.strictEqual(result.response.body.id, 12);
                });

        });

    });
});