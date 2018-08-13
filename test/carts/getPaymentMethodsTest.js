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
const requestConfig = require('../lib/config').requestConfig;
const config = require('../lib/config').config;

/**
 * Describes the unit tests for Magento get available payment methods list operation.
 */
describe('Magento getPaymentMethods for a cart', () => {

    describe('Unit Tests', () => {

        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'getPaymentMethods');

        //validates that the response object is valid
        it('successfully returns a list of payment methods for a cart', () => {
            let args = {
                id: 'dummy-id'
            };

            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/payment-methods`), 'GET');

            const expectedArgs = [
                postRequestWithBody
            ];

            let mockedResponse = [{"id":"checkmo","name":"Check / Money order"}];

            return this.prepareResolve(mockedResponse, expectedArgs).execute(Object.assign(args, config))
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.statusCode);
                    assert.isDefined(result.response.body);
                    assert.isArray(result.response.body);
                    assert.lengthOf(result.response.body, 1);
                });
        });

        it('returns empty list for unexpected response', () => {
            let args = {
                id: 'dummy-id'
            };

            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/payment-methods`), 'GET');

            const expectedArgs = [
                postRequestWithBody
            ];

            let mockedResponse = {dummy: "dummy"};

            return this.prepareResolve(mockedResponse, expectedArgs).execute(Object.assign(args, config))
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
