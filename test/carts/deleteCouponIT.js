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

/**
 * For this test to pass a coupon with code coupon10 should be configured in Magento.
 */
describe('magento deleteCoupon', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        const productVariantId = 'eqbisumas-10';
        const couponCode = 'coupon10';

        let cartId;
        let cartEntryId;

        /** Create cart and add coupon code to cart. */
        beforeEach(function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'postCartEntry')
                       .query({
                            currency: 'USD',
                            quantity: 1,
                            productVariantId: productVariantId
                        })
                       .then(function (res) {
                           expect(res).to.be.json;
                           expect(res).to.have.status(HttpStatus.CREATED);

                           // Store cart id
                           cartId = res.body.id;
                           cartEntryId = res.body.cartEntries[0].id;

                           return chai.request(env.openwhiskEndpoint)
                           .post(env.cartsPackage + 'postCoupon')
                           .query({
                               id: cartId,
                               code: couponCode
                           })
                       })
                       .then(function (res) {
                            expect(res).to.be.json;
                            expect(res).to.have.status(HttpStatus.OK);
                            expect(res.body).to.have.property('coupons');
                            expect(res.body.coupons).to.have.lengthOf(1);

                            let coupon = res.body.coupons[0];
                            expect(coupon).to.have.property('id');
                            expect(coupon).to.have.property('code');
                            expect(coupon.code).to.equal(couponCode);
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
                });
        });

        it('deletes a coupon code from an existing cart', function () {
            const args = {
                id: cartId,
                code: couponCode
            };
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + 'deleteCoupon')
                .query(args)
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body).to.not.have.property('coupons');
                });
        });

        it('returns 404 for deleting a coupon code from a non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'deleteCoupon')
                       .query({
                           id: 'non-existing-cart-id',
                           code: couponCode
                       })
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                       });
        });

        it('returns 400 for a missing coupon code', function () {
            return chai.request(env.openwhiskEndpoint)
                       .post(env.cartsPackage + 'deleteCoupon')
                       .query({
                           id: cartId
                       })
                       .catch(function (err) {
                           expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                       });
        });
    });
});