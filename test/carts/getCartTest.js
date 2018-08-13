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
const samplecart404 = require('../resources/sample-cart-404');
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;
const specsBuilder = require('../lib/config').specsBuilder;

/**
 * Describes the unit tests for magento cart operation.
 */
describe('Magento getCart', () => {
    
    describe('Unit Tests', () => {
        
        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'getCart');
        
        //validates that the response object is valid
        //cart properties and values are validated on object mapper tests
        specsBuilder().forEach(spec => {
        it(`successfully returns a ${spec.name} cart`, () => {
                const expectedArgs =
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token);

                return this.prepareResolve(samplecart, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.statusCode);
                        assert.isDefined(result.response.body);
                        assert.strictEqual(result.response.body.id, spec.args.id);
                    });
            })
        });

        it('returns 404 for a non-existing cart', () => {
            //for http code = 404, get cart returns Promise.resolve indicating that the item was not found
            return this.prepareReject(samplecart404)
                    .execute({'id': 'dummy-1'})
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.error);
                        assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
                    });
        });
        
        it('returns unexpected error', () => {
            //for any http code <> 200, 404, get cart returns Promise.reject(error)
            return this.prepareReject({'code': 'UNKNOWN'}).execute({'id': 'dummy-1'}).then(result => {
                assert.strictEqual(result.response.error.name, 'UnexpectedError');
            });
        });
        
        it('returns invalid argument error', () => {
            //for any http code <> 200, 404, get cart returns Promise.reject(error)
            return this.deleteArgs().prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
            });
        });
        
        it('returns missing property error when no cart id is provided', () => {
            //for any http code <> 200, 404, get cart returns Promise.reject(error)
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });
        
        it('returns unexpected error when the response is empty', () => {
            return this.prepareReject(undefined).execute({'id': 'dummy-1'}).then(result => {
                assert.strictEqual(result.response.error.name, 'UnexpectedError');
            });
        });
        
    });
});
