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

describe('magento postCustomerLogin', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        it('returns HTTP 501 not implemented error for guest authentication', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.customersPackage + 'postCustomerAuth')
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'guest'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.NOT_IMPLEMENTED);
                    expect(res.body.message).to.equal('NotImplementedError: Not implemented');
                });
        });

    });
});