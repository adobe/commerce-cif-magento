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
const extractToken = require('../lib/setupIT').extractToken;
const CCS_MAGENTO_CUSTOMER_TOKEN = require('../../src/common/MagentoClientBase').const().CCS_MAGENTO_CUSTOMER_TOKEN;

chai.use(chaiHttp);

// IMPORTANT: This IT is still based on postCustomeLogin because postCustomerAuth does not permit to get the customer id
// This means that we will probably have to introduce a /customers/me endpoint.

describe('magento getCustomerById', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let customerId;
        let accessToken;

        /** Create cart. */
        beforeEach(function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.customersPackage + '/login') // Use old endpoint to get the customer id
                .set('Cache-Control', 'no-cache')
                .send({
                    email: env.magentoCustomerName,
                    password: env.magentoCustomerPwd
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    //store the token
                    accessToken = extractToken(res);
                    customerId = res.body.customer.id;
                });
        });

        it('fails when the customer token is not provided', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + `/${customerId}`)
                .set('Cache-Control', 'no-cache')
                .then(function (response) {
                    expect(response).to.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
                    expect(response).to.be.json;
                    requiredFields.verifyErrorResponse(response.body);
                });
        });

        it('returns 500 error for a non existent customer', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + `/does-not-exist`)
                .set('Cache-Control', 'no-cache')
                .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                .then(function(response) {
                    expect(response).to.have.status(HttpStatus.INTERNAL_SERVER_ERROR);
                    expect(response).to.be.json;
                    requiredFields.verifyErrorResponse(response.body);
                });
        });

        it('succesfully returns a customer', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + `/${customerId}`)
                .set('Cache-Control', 'no-cache')
                .set('cookie', `${CCS_MAGENTO_CUSTOMER_TOKEN}=${accessToken};`)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    requiredFields.verifyCustomer(res.body);
                    expect(res.body.id).to.equal(customerId);
                    expect(res.body).to.have.own.property('createdAt');
                });
        });

    });
});