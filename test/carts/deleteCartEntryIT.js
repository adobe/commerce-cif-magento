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

const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');
const setup = require('../lib/setupIT.js').setup;
const requiredFields = require('../lib/requiredFields');

const expect = chai.expect;
chai.use(chaiHttp);


describe('magento deleteCartEntry', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        const productVariantIdSecond = env.PRODUCT_VARIANT_EQBISUMAS_11;

        let cartId;
        let cartEntryId;

        /** Create cart and add product. */
        before(function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    quantity: 2,
                    productVariantId: productVariantId
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);

                    // Store cart id
                    cartId = res.body.id;
                    // Store cart entry id
                    cartEntryId = res.body.entries[0].id;
                });
        });

        /** Delete cart. */
        after(function() {
            // no need to clean up the entry here because it is removed in the tests
        });
        
        // Add another product, remove original product, verify that added product is still there
        it('only removes one entry from a cart', function() {
            let cartEntryIdSecond;

            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    id: cartId,
                    quantity: 5,
                    productVariantId: productVariantIdSecond
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    requiredFields.verifyCart(res.body);

                    // Verify that two products are in the cart
                    expect(res.body.entries).to.have.lengthOf(2);
                
                    for(let entry of res.body.entries) {
                        if (entry.productVariant.sku === productVariantIdSecond) {
                            cartEntryIdSecond = entry.id;
                        }
                    }

                    // Remove newly added product
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'deleteCartEntry')
                        .query({
                            id: cartId,
                            cartEntryId: cartEntryIdSecond
                        });
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyCart(res.body);

                    // Verify that only original product is still in the cart
                    expect(res.body.entries).to.have.lengthOf(1);
                    expect(res.body.entries[0].id).to.equal(cartEntryId);
                });
        });
    
        it('removes an entry from a cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .query({
                    id: cartId,
                    cartEntryId: cartEntryId
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                
                    requiredFields.verifyCart(res.body);
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });
        
        it('returns a 400 error for an invalid entry id', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .query({
                    id: cartId,
                    cartEntryId: 'INVALID ENTRY |D'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 400 error for a non existent entry id', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .query({
                    id: cartId,
                    cartEntryId: 'does-not-exist'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 404 error for a non existent cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .query({
                    id: 'does-not-exist',
                    cartEntryId: cartEntryId
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 400 error for missing parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

    });
});