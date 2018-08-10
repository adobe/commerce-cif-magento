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
const specsBuilder = require('../lib/config').specsBuilder;

/**
 * Describes the unit tests for Magento cart operation.
 */
describe('Magento postCart', () => {
    
    describe('Unit Tests', () => {
        
        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'postCartEntry');
        
        it('creates a new empty guest cart', () => {

            let specs = specsBuilder();

            specs.forEach(spec => {
                const expectedArgs = [
                    requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseCart}`), 'POST', spec.token),
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                let mockedResponses = [];
                let id = spec.args.id;
                mockedResponses.push(`${id}`);
                mockedResponses.push(samplecartempty);
                mockedResponses.push('[]');

                //this is create cart so remove any cart id from spec
                delete spec.args.id;

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isEmpty(result.response.body.entries);
                    });
            });
        });
        
        it('adds a single product to an existing cart', () => {

            let specs = specsBuilder();

            specs.forEach(spec => {
                spec.args.productVariantId = 'eqbisucos-L';
                spec.args.quantity = 3;

                //build the expected requests
                let body = {
                    'cartItem': {
                        'quote_id': spec.args.id,
                        'sku': spec.args.productVariantId,
                        'qty': spec.args.quantity
                    }
                };
                let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/items`),
                    'POST', spec.token);
                postRequestWithBody.body = body;

                const expectedArgs = [
                    postRequestWithBody,
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token),
                ];
                //build responses
                let mockedResponses = [];
                mockedResponses.push(samplecartentry);
                mockedResponses.push(samplecart);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${spec.args.id}/entries/${samplecartentry.item_id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isNotEmpty(result.response.body.entries);
                    });
            });
        });

        it('creates a new guest cart and adds one product item', () => {

            let specs = specsBuilder();

            specs.forEach(spec => {

                spec.args.productVariantId = 'eqbisucos-L';
                spec.args.quantity = 1;

                //build the expected requests
                let body = {
                    'cartItem': {
                        'quote_id': spec.args.id,
                        'sku': spec.args.productVariantId,
                        'qty': spec.args.quantity
                    }
                };
                let postRequestWithBody = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/items`),
                    'POST', spec.token);
                postRequestWithBody.body = body;

                const expectedArgs = [
                    requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}`), 'POST', spec.token), // creates the empty cart
                    postRequestWithBody,  //adds the items
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)  //gets the cart
                ];

                //build the responses
                let mockedResponses = [];
                mockedResponses.push(samplecartempty);
                mockedResponses.push(samplecartentry);
                mockedResponses.push(samplecart);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 201);
                        assert.isDefined(result.response.headers);
                        assert.strictEqual(result.response.headers.Location, `carts/${spec.args.id}/entries/${samplecartentry.item_id}`);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                        assert.isNotEmpty(result.response.body.entries);
                    });
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

        it('returns invalid argument for non integer quantity', () => {
            //for any http code <> 200, 404, get cart returns Promise.reject(error)
            return this.prepareReject(null).execute({
                id: 'not-extisting-cart-id',
                productId: 'eqbisucos-L',
                quantity: ''
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'InvalidArgumentError');
            });
        });

        it('returns missing property when quantity is not provided', () => {
            //for any http code <> 200, 404, get cart returns Promise.reject(error)
            return this.prepareReject(null).execute({
                id: 'not-extisting-cart-id',
                productId: 'eqbisucos-L'
            }).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
        });

    })
});
