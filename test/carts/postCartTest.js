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
const samplecartempty = require('../resources/sample-cart-empty');
const samplecartentry = require('../resources/sample-cart-entry');
const samplecart404 = require('../resources/sample-cart-404');
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;

/**
 * Describes the unit tests for Magento cart operation.
 */
describe('Magento postCart', () => {
    
    describe('Unit Tests', () => {
        
        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'postCartEntry');
        
        it('creates a new empty guest cart', () => {
            let args = {
                id: 'dummy-id'
            }
            const expectedArgs = [
                requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts`), 'POST'),
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/${args.id}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET')
            ];
            
            let mockedResponses = [];
            mockedResponses.push('dummy-id');
            mockedResponses.push(samplecartempty);
            mockedResponses.push('[]');
            
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${args.id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isEmpty(result.response.body.cartEntries);
                    });
        });
        
        it('adds a single product to an existing cart', () => {
            let args = {
                id: 'dummy-id',
                productVariantId: 'eqbisucos-L',
                quantity: 3
            };
            //build the expected requests
            let body = {
                'cartItem': {
                    'quote_id': args.id,
                    'sku': args.productVariantId,
                    'qty': args.quantity
                }
            };
            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/items`), 'POST');
            postRequestWithBody.body = body;
            
            const expectedArgs = [
                postRequestWithBody,
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/dummy-id?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET'),
            ];
            //build responses
            let mockedResponses = [];
            mockedResponses.push(samplecartentry);
            mockedResponses.push(samplecart);
            
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${args.id}/entries/${samplecartentry.item_id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isNotEmpty(result.response.body.cartEntries);
                    });
        });
        
        it('creates a new guest cart and adds one product item', () => {
            let args = {
                id: 'dummy-id',
                productVariantId: 'eqbisucos-L',
                quantity: 3
            };
            //build the expected requests
            let body = {
                'cartItem': {
                    'quote_id': args.id,
                    'sku': args.productVariantId,
                    'qty': args.quantity
                }
            };
            let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/items`), 'POST');
            postRequestWithBody.body = body;
    
            const expectedArgs = [
                requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/guest-carts/${args.id}/items`), 'POST'),
                postRequestWithBody,
                requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/guest-aggregated-carts/dummy-id?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`, 'GET'),
            ];
            //build the responses
            let mockedResponses = [];
            mockedResponses.push(samplecartempty);
            mockedResponses.push(samplecartentry);
            mockedResponses.push(samplecart);
            
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${args.id}/entries/${samplecartentry.item_id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isNotEmpty(result.response.body.cartEntries);
                    });
        });
        
        it('fails with HTTP 404 not found when adding products to an non existing cart', () => {
            return this.prepareReject(samplecart404)
                    .execute({
                        id: 'not-extisting-cart-id',
                        productId: 'eqbisucos-L',
                        quantity: 3
                    })
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.error);
                        assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
                    });
        });
    })
});
