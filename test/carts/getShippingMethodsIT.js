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


describe('Magento getShippingMethodsIT for a cart', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        const productVariantId = 'eqbisumas-10';

        /** Create cart. */
        before(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postCart')
                .query({
                    currency: 'USD',
                    quantity: 2,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.id).to.not.be.empty;

                    // Store cart id
                    cartId = res.body.id;
                })
                .catch(function (err) {
                    throw err;
                });
        });

        /** Delete cart. */
        after(function () {
            // TODO(mabecker): Delete cart with id = cartId
        });

        it('returns the list of available shipping methods for the cart', function () {
            // set valid shipping address for cart
            const args = {
                id: cartId
            };
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postShippingAddress')
                .query(args)
                .send({
                    address: { country: 'US' }
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body).to.have.property('shippingAddress');

                    return chai.request(env.openwhiskEndpoint)
                        .get(env.cartsPackage + 'getShippingMethods')
                        .query({ id: cartId });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify shipping methods structure
                    expect(res.body).to.be.an('array');
                    res.body.forEach(shippingMethod => {
                        expect(shippingMethod).to.have.all
                            .keys('id', 'name', 'description', 'price');
                    });
                })
                .catch(function (err) {
                    throw err;
                });
        });

        it('returns a 400 error for a cart without shipping address', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + 'getShippingMethods')
                .query({ id: cartId })
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns a 400 error for a missing id parameter', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + 'getShippingMethods')
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns a 404 error for a non existent shopping cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + 'getShippingMethods')
                .query({ id: 'does-not-exist' })
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                });
        });
    });
});