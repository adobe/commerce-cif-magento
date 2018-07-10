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
const expect = chai.expect;

chai.use(chaiHttp);


describe('magento postCartEntry', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        let cartEntryIdSecond;
        const productVariantId = 'eqbisumas-10';
        const productVariantIdSecond = 'eqbisumas-11';

        /** Create cart. */
        before(function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCart')
                .query({
                    currency: 'USD',
                    quantity: 3,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.id).to.not.be.empty;

                    // Store cart id
                    cartId = res.body.id;
                    cartEntryId = res.body.cartEntries[0].id;
                })
                .catch(function(err) {
                    throw err;
                });
        });

        /** Delete cart entry. */
        after(function() {
            return Promise.all([chai.request(env.openwhiskEndpoint)
                    .post(env.cartsPackage + 'deleteCartEntry')
                    .query({
                        id: cartId,
                        cartEntryId: cartEntryId
                    }),chai.request(env.openwhiskEndpoint)
                    .post(env.cartsPackage + 'deleteCartEntry')
                    .query({
                        id: cartId,
                        cartEntryId: cartEntryIdSecond
                    })])
                    .then(function (res) {
                        expect(res[0]).to.be.json;
                        expect(res[0]).to.have.status(HttpStatus.OK);

                        expect(res[1]).to.be.json;
                        expect(res[1]).to.have.status(HttpStatus.OK);

                        expect(res[1].body.cartEntries).to.have.lengthOf(0);
                    });

        });

        it('creates an empty cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    currency: 'EUR'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    expect(res.body).to.have.own.property('id');
                    expect(res.body.id).to.not.be.empty;
                    expect(res.body).to.have.own.property('lastModifiedDate');
                    //an empty cart should have no price
                    expect(res.body).to.not.have.property('totalProductPrice');
                    expect(res.body).to.have.own.property('createdDate');
                    expect(res.body).to.have.own.property('cartEntries');
                    expect(res.body.cartEntries).to.have.lengthOf(0);
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('adds a product to an existing cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    quantity: 2,
                    id: cartId,
                    productVariantId: productVariantIdSecond
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Verify structure
                    expect(res.body).to.have.own.property('id');
                    expect(res.body.id).to.equal(cartId);
                    expect(res.body).to.have.own.property('lastModifiedDate');
                    expect(res.body).to.have.own.property('totalProductPrice');
                    expect(res.body).to.have.own.property('createdDate');
                    expect(res.body).to.have.own.property('cartEntries');
                    expect(res.body.cartEntries).to.have.lengthOf(2);
                    cartEntryIdSecond = res.body.cartEntries[1].id;
                    // Verify that product was added
                    let addedEntry;
                    for(let entry of res.body.cartEntries) {
                        if(entry.productVariant.sku == productVariantIdSecond) {
                            addedEntry = entry;
                        }
                    }
                    expect(addedEntry.quantity).to.equal(2);
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('adds a product to a new cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    currency: 'USD',
                    quantity: 2,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    expect(res.body).to.have.own.property('id');
                    expect(res.body.id).to.not.be.empty;
                    expect(res.body).to.have.own.property('lastModifiedDate');
                    expect(res.body).to.have.own.property('totalProductPrice');
                    expect(res.body).to.have.own.property('createdDate');
                    expect(res.body).to.have.own.property('cartEntries');
                    expect(res.body.cartEntries).to.have.lengthOf(1);

                    // Verify entry structure
                    const entry = res.body.cartEntries[0];
                    expect(entry).to.have.own.property('id');
                    expect(entry).to.have.own.property('quantity');
                    expect(entry.quantity).to.equal(2);
                    expect(entry).to.have.own.property('productVariant');
                    expect(entry.productVariant.sku).to.equal(productVariantId);
                    expect(entry).to.have.own.property('cartEntryPrice');
                    
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('returns a 400 error for an invalid currency', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    currency: 'EURO'
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns a 400 error for an invalid quantity', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    quantity: -12,
                    id: cartId,
                    productVariantId: productVariantIdSecond
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns a 404 error for an invalid product variant id', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    quantity: 1,
                    id: cartId,
                    productVariantId: 'does-not-exists'
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                });
        })

        it('returns a 404 error for adding a product to a non existent cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    quantity: 1,
                    id: 'does-not-exist',
                    productVariantId: productVariantId
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                });
        });

        it('returns a 400 error for missing parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

    });
});