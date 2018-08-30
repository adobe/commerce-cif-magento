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
const specsBuilder = require('../lib/config').specsBuilder;
const samplecart404 = require('../resources/sample-cart-404');

describe('Magento postOrder', () => {
    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'postOrder');

        it('returns an error for missing cartId parameter', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

        specsBuilder().forEach(spec => {
            it(`returns an order for a ${spec.name} cart`, () => {
                return this.prepareResolve('12', requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/order`),
                    'PUT', spec.token))
                    .execute(Object.assign({cartId: spec.args.id, __ow_headers: spec.args.__ow_headers}, config))
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

        it('returns 404 for a non-existing cart', () => {
            return this.prepareReject(samplecart404)
                .execute({'cartId': 'dummy-1'})
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
                });
        });

    });
});