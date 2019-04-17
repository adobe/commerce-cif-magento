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


describe('Magento getPaymentMethodsIT for a cart', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;

        /** Create an empty cart. */
        beforeEach(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res.body.id).to.not.be.empty;

                    // Store cart id
                    cartId = res.body.id;
                });
        });

        it('returns the list of available payment methods for the cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + `/${cartId}/paymentmethods`)
                .set('Cache-Control', 'no-cache')
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify payment methods structure
                    expect(res.body).to.be.an('array').with.length(3);
                    res.body.forEach(paymentMethod => {
                        requiredFields.verifyPaymentMethod(paymentMethod);
                    });
                });
        });

        it('returns a 404 error for a non existent shopping cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.cartsPackage + '/does-not-exist/paymentmethods')
                .set('Cache-Control', 'no-cache')
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });
    });
});