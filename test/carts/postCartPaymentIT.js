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


describe('Magento postCartPayment', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        let ccifPayment = {
            token: '1234',
            methodId: 'checkmo',
            statusCode: '1',
            status: 'Paid',
            amount: {
                amount: 17900,
                currency: 'USD'
            }
        };
        
        /** Create empty cart. */
        before(function () {
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
                    cartEntryId = res.body.entries[0].id;
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
                });
        });

        /** Delete cart. */
        after(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCartEntry')
                .query({
                    id: cartId,
                    cartEntryId: cartEntryId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });

        it('returns 400 for posting the payment to an non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartPayment')
                .query({
                    id: 'non-existing-cart-id',
                })
                .send({
                    payment: ccifPayment
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 400 for posting the payment without payment', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartPayment')
                .query({
                    id: cartId
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('sets payment method', function () {
            const args = {
                id: cartId,
            };
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCartPayment')
                .query(args)
                .send({
                    payment: ccifPayment
                })
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyCart(res.body);

                    expect(res.body).to.have.property('payments');
                    let payments = res.body.payments;
                    expect(payments).to.be.an('array').with.length(1);
                    let payment = res.body.payments[0];
                    requiredFields.verifyPayment(payment);
                    expect(payment.methodId).to.equal('checkmo');
                });
        });
    });
});