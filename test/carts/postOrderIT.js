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
const CCS_MAGENTO_CUSTOMER_TOKEN = require('../../src/common/MagentoClientBase').const().CCS_MAGENTO_CUSTOMER_TOKEN;

const expect = chai.expect;

chai.use(chaiHttp);


describe('Magento postOrder IT', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        const addr = {
            title: 'Work',
            salutation: 'Ms',
            firstName: 'Cat Eye',
            lastName: 'Nebulae',
            streetName: 'Draco',
            streetNumber: '3,262',
            postalCode: '666666',
            city: 'Constellation',
            region: 'CA',
            country: 'US',
            email: 'cat.eye@zeus.com',
            phone: '66666666666'
        };
        let ccifPayment = {
            token: '1234',
            method: 'checkmo',
            statusCode: '1',
            status: 'Paid',
            amount: {
                amount: 17900,
                currency: 'USD'
            }
        };

        let cartId;
        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        let accessToken;

        /** Create cart. */
        before(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartEntry')
                .query({
                    currency: 'USD',
                    quantity: 5,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);

                    // Store cart id
                    cartId = res.body.id;

                    return chai.request(env.openwhiskEndpoint)
                        .get(env.customersPackage + 'postCustomerLogin')
                        .set('Cache-Control', 'no-cache')
                        .query({
                            email: env.magentoCustomerName,
                            password: env.magentoCustomerPwd
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    requiredFields.verifyLoginResult(res.body);
                    expect(res.body.customer.email).to.equal(env.magentoCustomerName);
                    //check cookie is set
                    accessToken = extractToken(res);
                    expect(accessToken).to.not.be.undefined;
                    //create a new customer cart
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postCartEntry')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({
                            currency: 'USD',
                            quantity: 5,
                            productVariantId: productVariantId
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                });
        });

        // check that the anonymous and customer cart are not available anymore.
        after(function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + 'getCart')
                .set('Cache-Control', 'no-cache')
                .query({id: cartId})
                .then(function (res) {
                    expect(res).to.be.json;
                    //this is a bug on the extension service which returns 500 when a cart was `ordered`
                    //https://github.com/adobe/commerce-cif-magento-extension/issues/12
                    //should be replaced with 404 or (200 and cartEntries.length = 0) when a fix will be avail.
                    expect(res).to.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
                    return chai.request(env.openwhiskEndpoint)
                        .get(env.cartsPackage + 'getCart')
                        .set('Cache-Control', 'no-cache')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({id: cartId})
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                });
        });

        it('returns 400 for updating the order when the cart id is missing', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage + 'postOrder')
                .query({})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 404 for creating an order from a non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage + 'postOrder')
                .query({cartId: 'non-existing-cart-id-1'})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 400 for creating an order from a cart without shipping address', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage + 'postOrder')
                .query({cartId: cartId})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 201 for creating an order for a guest cart', function () {
            // Set billing address
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postBillingAddress')
                .query({
                    id: cartId
                })
                .send({
                    address: addr
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping address
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postShippingAddress')
                        .query({
                            id: cartId,
                            default_method: 'flatrate',
                            default_carrier: 'flatrate'
                        })
                        .send({
                            address: addr
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set payment
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postPayment')
                        .query({
                            id: cartId
                        })
                        .send({
                            payment: ccifPayment
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Submit order
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.ordersPackage + 'postOrder')
                        .query({
                            cartId: cartId
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res).to.have.property('headers');
                    expect(res.headers).to.have.property('location');
                    requiredFields.verifyOrder(res.body);
                });
        });

        it('returns 201 for creating an order for a customer cart', function () {
            // Set billing address
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postBillingAddress')
                .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                .query({
                    id: cartId
                })
                .send({
                    address: addr
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping address
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postShippingAddress')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({
                            id: cartId,
                            default_method: 'flatrate',
                            default_carrier: 'flatrate'
                        })
                        .send({
                            address: addr
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set payment
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postPayment')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({
                            id: cartId
                        })
                        .send({
                            payment: ccifPayment
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Submit order
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.ordersPackage + 'postOrder')
                        .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                        .query({
                            cartId: cartId
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res).to.have.property('headers');
                    expect(res.headers).to.have.property('location');
                    requiredFields.verifyOrder(res.body);
                });
        });

    });
});