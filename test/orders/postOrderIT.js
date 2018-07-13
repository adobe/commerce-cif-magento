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


describe('Magento postOrder', function () {

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
                centAmount: 17900,
                currency: 'USD'
            }
        };

        let cartId;
        const productVariantId = 'eqbisumas-10';

        /** Create empty cart. */
        beforeEach(function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postCartEntry')
                       .query({
                           currency: 'USD',
                           quantity: 5,
                           productVariantId: productVariantId
                       })
                       .then(function (res) {
                           expect(res).to.be.json;
                           expect(res).to.have.status(HttpStatus.OK);

                           // Store cart id
                           cartId = res.body.id;
                       })
                       .catch(function (err) {
                           throw err;
                       });
        });

        /** Delete cart. */
        after(function () {
            // TODO: CIF-239
        });

        it('returns 400 for updating the order when the cart id is missing', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.ordersPackage + 'postOrder')
                       .query({})
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                       });
        });

        it('returns 404 for creating an order from a non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.ordersPackage + 'postOrder')
                       .query({cartId: 'non-existing-cart-id-1'})
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                       });
        });

        it('returns 400 for creating an order from a cart without shipping address', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.ordersPackage + 'postOrder')
                       .query({cartId: cartId})
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                       });
        });

        it('returns 200 for creating an order', function () {
            // Set billing address
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postBillingAddress')
                       .query({
                            id: cartId
                        })
                        .send({
                            address: addr
                        })
                        .then(function() {
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
                        .then(function () {
                            // Set payment
                            return chai.request(env.openwhiskEndpoint)
                                       .post(env.cartsPackage + 'postPayment')
                                       .query({
                                           id: cartId
                                       })
                                       .send({
                                           payment: ccifPayment
                                       });
                        }).then(function () {
                            // Submit order
                           return chai.request(env.openwhiskEndpoint)
                                      .post(env.ordersPackage + 'postOrder')
                                      .query({
                                          cartId: cartId
                                      });
                        }).then(function (res) {
                            // Verify order
                            expect(res).to.be.json;
                            expect(res).to.have.status(HttpStatus.OK);
                            expect(res.body).to.have.property('id');
                        });
        });

    });
});