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

describe('magento getCustomer', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        let accessToken;

        beforeEach(function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'postCustomerAuth')
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'credentials',
                    email: env.magentoCustomerName,
                    password: env.magentoCustomerPwd
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    accessToken = res.body.access_token;
                });
        });

        it('fails when the customer token is not provided', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'getCustomer')
                .set('Cache-Control', 'no-cache')
                .then(function (response) {
                    expect(response).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(response).to.be.json;
                    requiredFields.verifyErrorResponse(response.body);
                });
        });

        it('fails when a wrong token is provided', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'getCustomer')
                .set('Cache-Control', 'no-cache')
                .set('Authorization', `Bearer 12345`)
                .then(function(response) {
                    expect(response).to.have.status(HttpStatus.UNAUTHORIZED);
                    expect(response).to.be.json;
                    requiredFields.verifyErrorResponse(response.body);
                });
        });

        it('succesfully returns a customer', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'getCustomer')
                .set('Cache-Control', 'no-cache')
                .set('Authorization', `Bearer ${accessToken}`)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    requiredFields.verifyCustomer(res.body);
                });
        });

    });
});