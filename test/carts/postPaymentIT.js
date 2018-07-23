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


describe('Magento postPayment', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        const productVariantId = 'eqbisumas-10';
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
                           cartEntryId = res.body.cartEntries[0].id;
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
                       .catch(function (err) {
                           throw err;
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

                        expect(res.body.cartEntries).to.have.lengthOf(0);
                    })
                    .catch(function (err) {
                        throw err;
                    });
        });

        it('returns 400 for posting the payment to an non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postPayment')
                       .query({
                           id: 'non-existing-cart-id',
                       })
                       .send({
                           payment: ccifPayment
                       })
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                       });
        });

        it('returns 400 for posting to payment without payment', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postPayment')
                       .query({
                           id: cartId
                       })
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                       });
        });

        it('sets payment method', function () {
            const args = {
                id: cartId,
            };
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postPayment')
                       .query(args)
                       .send({
                           payment: ccifPayment
                       })
                       .then(function(res) {
                           let payment = res.body.payment;
                           expect(res).to.be.json;
                           expect(res).to.have.status(HttpStatus.OK);
                           expect(payment).to.have.property('method');
                           expect(payment.method).to.equal('checkmo');
                       });
        });
    });
});