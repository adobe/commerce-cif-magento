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
const extractToken = require('../lib/setupIT').extractToken;
const expect = chai.expect;
const CCS_MAGENTO_CUSTOMER_TOKEN = require('../../src/common/MagentoClientBase').const().CCS_MAGENTO_CUSTOMER_TOKEN;
chai.use(chaiHttp);

describe('magento postCustomerLogin', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        const email = 'smaftei@adobe.com';
        const password = 'Adobe1234';
        const productVariantId = 'eqbisumas-10';

        it('successfully login a customer', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'postCustomerLogin')
                .set('Cache-Control', 'no-cache')
                .query({
                    email: email,
                    password: password
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    requiredFields.verifyLoginResult(res.body);
                    expect(res.body.customer.email).to.equal(email);
                    expect(res.body.cart).to.not.be.undefined;
                    //check cookie is set
                    let accessToken = extractToken(res);
                    expect(accessToken).to.not.be.undefined;
                });
        });

        it('successfully login a customer & operates on a cart', function() {
            let accessToken;
            let cartId;
            //login customer
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'postCustomerLogin')
                .set('Cache-Control', 'no-cache')
                .query({
                    email: email,
                    password: password
                })
                //verify the login and store the accessToken
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    requiredFields.verifyLoginResult(res.body);
                    expect(res.body.customer.email).to.equal(email);
                    expect(res.body.cart).to.not.be.undefined;
                    //check cookie is set
                    accessToken = extractToken(res);
                    expect(accessToken).to.not.be.undefined;
                    cartId = res.body.cart.id;
                    return res;
                })
                //add a cart entry
                .then(function (res) {
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postCartEntry')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({
                            id: cartId,
                            currency: 'EUR',
                            quantity: 1,
                            productVariantId: productVariantId
                        });
                })
                //delete the entry
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    requiredFields.verifyCart(res.body);
                    let promises = [];
                    res.body.entries.forEach(entry => {
                        requiredFields.verifyCartEntry(entry);
                        promises.push(chai.request(env.openwhiskEndpoint)
                            .post(env.cartsPackage + 'deleteCartEntry')
                            .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                            .query({
                                id: cartId,
                                cartEntryId: entry.id
                            }));
                    });
                    return Promise.all(promises).then(function (results) {
                        return results;
                    });
                }).then(results => {
                    results.forEach(result => {
                        expect(result).to.be.json;
                        expect(result).to.have.status(HttpStatus.OK);
                    });
                })
                //get the cart and check that's empty
                .then( () => {
                    return chai.request(env.openwhiskEndpoint)
                        .get(env.cartsPackage + 'getCart')
                        .set('Cache-Control', 'no-cache')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({id: cartId})
                        .then(function (cartResult) {
                            return cartResult;
                        })
                })
                .then(cartResult => {
                    expect(cartResult).to.be.json;
                    expect(cartResult).to.have.status(HttpStatus.OK);

                    // Verify structure
                    requiredFields.verifyCart(cartResult.body);
                    expect(cartResult.body).to.have.own.property('lastModifiedAt');

                    expect(cartResult.body.id).to.equal(`${cartId}`);
                    expect(cartResult.body).to.have.own.property('createdAt');
                    expect(cartResult.body.entries).to.have.lengthOf(0);

                });
        });

        it('returns a 401 for an non existing customer email', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'postCustomerLogin')
                .set('Cache-Control', 'no-cache')
                .query({
                    email: 'unexisting@false.com',
                    password: password
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.UNAUTHORIZED);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

    });
});