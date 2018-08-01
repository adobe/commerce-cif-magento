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

const assert = require('chai').assert;
const utils = require('../lib/utils');
const magentoCustomer = require('../resources/sample-customer');

describe('Magento CustomerMapper', () => {
    describe('Unit Tests', () => {

        let mapper = utils.getPathForAction(__dirname, 'CustomerMapper');
        let formatDate = require(mapper.replace('CustomerMapper', 'node_modules/@adobe/commerce-cif-magento-common/utils')).formatDate;
        const CustomerMapper = require(mapper);

        it('maps the customer correctly', () => {
            let ccifCustomer = CustomerMapper._mapCustomer(magentoCustomer);

            assert.strictEqual(ccifCustomer.id, magentoCustomer.id);
            assert.strictEqual(ccifCustomer.email, magentoCustomer.email);
            assert.strictEqual(ccifCustomer.firstName, magentoCustomer.firstname);
            assert.strictEqual(ccifCustomer.createdAt, formatDate(magentoCustomer.created_at));
            assert.strictEqual(ccifCustomer.lastModifiedAt, formatDate(magentoCustomer.updated_at));
        });

        it('returns an error if the customer has no id', () => {
            let noIdCustomer = Object.assign({}, magentoCustomer);
            delete noIdCustomer.id;
            try {
                CustomerMapper._mapCustomer(noIdCustomer);
            }
            catch (error) {
                assert.isTrue(error.toString().indexOf("MissingPropertyException") > 1);
            }
        });


        it('returns a login result which contains a customer', () => {
            let loginResult = CustomerMapper.mapCustomerLogin(magentoCustomer);
            assert.exists(loginResult.customer);
        });

    });
});
