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

describe('Magento postShippingMethod', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        const productVariantId = 'eqbisumas-10';

        // Create new cart with one product
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
                    cartEntryId = res.body.cartEntries[0].id;

                })
                .catch(function (err) {
                    throw err;
                });
        });

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

        it('returns 404 for updating the shipping method of non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postShippingMethod')
                .query({
                    id: 'non-existing-cart-id',
                    shippingMethodId: 'flatrate_flatrate'
                })
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                });
        });

        it('returns 400 for updating the shipping method with no parameters', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postShippingMethod')
                .query({
                    id: cartId
                })
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns 400 for updating the shipping method with invalid shipping method format', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postShippingMethod')
                .query({
                    id: cartId,
                    shippingMethodId: 'xyz'
                })
                .catch(function (err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('sets shipping method', function () {
            const args = {
                id: cartId,
                shippingMethodId: 'flatrate_flatrate'
            };

            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'postShippingAddress')
                .query({
                    id: cartId
                })
                .send({
                    address: { country: 'US' }
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping address
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + 'postShippingMethod')
                        .query(args);
                })
                .then(function (res) {
                    // Verify cart shipping info
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body).to.have.property('shippingInfo');
                    expect(res.body.shippingInfo).to.have.property('id');
                    expect(res.body.shippingInfo).to.have.property('name');
                    expect(res.body.shippingInfo).to.have.property('price');
                });
        });
    });
});