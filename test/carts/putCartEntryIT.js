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
const requiredFields = require('../lib/requiredFields');

chai.use(chaiHttp);


describe('magento putCartEntry', function () {
    
    describe('Integration tests', function () {
        
        // Get environment
        let env = setup();
        
        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);
        
        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        
        let cartId;
        let cartEntryId;
        
        /** Create cart. */
        before(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .query({
                    currency: 'USD',
                    quantity: 2,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    
                    // Store cart id
                    cartId = res.body.id;
                    
                    // Store cart entry id
                    cartEntryId = res.body.entries[0].id;
                });
        });
        
        /** Delete cart entry. */
        after(function () {
            // no need to clean up the entry here because it is removed in the tests
        });
        
        it('updates the quantity of a cart entry to a new value', function () {
            const newQuantity = 1;
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .send({
                    quantity: newQuantity
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    requiredFields.verifyCart(res.body);
                    expect(res.body.id).to.equal(cartId);
                    expect(res.body).to.have.own.property('lastModifiedAt');
                    expect(res.body).to.have.own.property('createdAt');

                    // Verify cart content
                    expect(res.body.entries).to.have.lengthOf(1);
                    expect(res.body.entries[0].id).to.equal(cartEntryId);
                    expect(res.body.entries[0].quantity).to.equal(newQuantity);
                });
        });

        it('returns a 400 error for setting an invalid quantity', function () {
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .send({
                    quantity: -100
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('removes a cart entry from the cart by setting its quantity to 0', function () {
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .send({
                    quantity: 0
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyCart(res.body);
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });
        
        it('returns a 404 error for updating a non existent cart entry', function () {
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/${cartId}/entries/does-not-exist`)
                .send({
                    quantity: 1
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });
        
        it('returns a 404 error for updating an entry of a non existent cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/does-not-exist/entries/${cartEntryId}`)
                .send({
                    quantity: 1
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });
        
        it('returns a 400 error for missing parameters', function () {
            return chai.request(env.openwhiskEndpoint)
                .put(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });
        
    });
});