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
                .post(env.cartsPackage)
                .send({
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
                        .post(env.customersPackage + '/auth')
                        .set('Cache-Control', 'no-cache')
                        .send({
                            type: 'credentials',
                            email: env.magentoCustomerName,
                            password: env.magentoCustomerPwd
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    //check cookie is set
                    accessToken = res.body.access_token;
                    expect(accessToken).to.not.be.undefined;
                    
                    //create a new customer cart
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage)
                        .set('authorization', `Bearer ${accessToken}`)
                        .send({
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
                .get(env.cartsPackage + `/${cartId}`)
                .set('Cache-Control', 'no-cache')
                .then(function (res) {
                    expect(res).to.be.json;
                    //this is a bug on the extension service which returns 500 when a cart was `ordered`
                    //https://github.com/adobe/commerce-cif-magento-extension/issues/12
                    //should be replaced with 404 or (200 and cartEntries.length = 0) when a fix will be avail.
                    expect(res).to.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
                    return chai.request(env.openwhiskEndpoint)
                        .get(env.cartsPackage + `/${cartId}`)
                        .set('Cache-Control', 'no-cache')
                        .set('authorization', `Bearer ${accessToken}`)
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                });
        });

        it('returns 400 for updating the order when the cart id is missing', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage)
                .send({})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 404 for creating an order from a non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage)
                .send({cartId: 'non-existing-cart-id-1'})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 400 for creating an order from a cart without shipping address', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.ordersPackage)
                .send({cartId: cartId})
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 201 for creating an order for a guest cart', function () {
            // Set billing address
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + `/${cartId}/billingaddress`)
                .send({
                    address: addr
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping address
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/shippingaddress`)
                        .send({
                            default_method: 'flatrate',
                            default_carrier: 'flatrate',
                            address: addr  
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set payment
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/payment`)
                        .send({
                            payment: ccifPayment
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Submit order
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.ordersPackage)
                        .send({
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
                .post(env.cartsPackage + `/${cartId}/billingaddress`)
                .set('authorization', `Bearer ${accessToken}`)
                .send({
                    address: addr
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping address
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/shippingaddress`)
                        .set('authorization', `Bearer ${accessToken}`)
                        .send({
                            default_method: 'flatrate',
                            default_carrier: 'flatrate',
                            address: addr
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set payment
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/payment`)
                        .set('authorization', `Bearer ${accessToken}`)
                        .send({
                            payment: ccifPayment
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Submit order
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.ordersPackage)
                        .set('authorization', `Bearer ${accessToken}`)
                        .send({
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