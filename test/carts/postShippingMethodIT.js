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

describe('Magento postShippingMethod', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;

        // Create new cart with one product
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
                    cartEntryId = res.body.entries[0].id;
                });
        });

        after(function () {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });

        it('returns 404 for setting the shipping method of non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + '/does-not-exist/shippingmethod')
                .send({
                    shippingMethodId: 'flatrate_flatrate'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 400 for updating the shipping method with no parameters', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + `/${cartId}/shippingmethod`)
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 400 for updating the shipping method with invalid shipping method format', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + `/${cartId}/shippingmethod`)
                .send({
                    shippingMethodId: 'xyz'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('sets shipping method', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + `/${cartId}/shippingaddress`)
                .send({
                    address: { country: 'US' }
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    // Set shipping method
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/shippingmethod`)
                        .send({
                            shippingMethodId: 'flatrate_flatrate'
                        });
                })
                .then(function (res) {
                    // Verify cart shipping info
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyCart(res.body);
                    expect(res.body).to.have.property('shippingInfo');
                    requiredFields.verifyShippingInfo(res.body.shippingInfo);
                });
        });
    });
});