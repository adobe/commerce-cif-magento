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

const Customer = require('@adobe/commerce-cif-model').Customer;
const LoginResult = require('@adobe/commerce-cif-model').LoginResult;
const MissingPropertyException = require('@adobe/commerce-cif-common/exception').MissingPropertyException;
const formatDate = require('@adobe/commerce-cif-magento-common/utils').formatDate;

/**
 * Utility class to map magento customer objects to CCIF objects. Private marked methods should not be used outside
 * of this class.
 */
class CustomerMapper {

    /**
     * Maps a Magento customer to a CCIF Customer object.
     *
     * @param magentoCustomer        A Magento customer object.
     * @returns {Customer}      A CCIF Customer object.
     */
    static mapCustomer(magentoCustomer) {
        return CustomerMapper._mapCustomer(magentoCustomer);
    }

    /**
     * @private
     */
    static _mapCustomer(magentoCustomer) {
        if (!magentoCustomer || !magentoCustomer.id) {
            throw new MissingPropertyException('Invalid customer response received from Magento');
        }
        let customer = new Customer(magentoCustomer.id);
        customer.email = magentoCustomer.email;
        customer.firstname = magentoCustomer.firstname;
        customer.lastname = magentoCustomer.lastname;
        customer.createdDate = formatDate(magentoCustomer.created_at);
        customer.lastModifiedDate = formatDate(magentoCustomer.updated_at);
        return customer;
    }

    /**
     * Maps a Magento login response to a CCIF LoginResult object.
     *
     * @param magentoCustomer          A Magento login response.
     * @returns {LoginResult}   A CCIF LoginResult object.
     */
    static mapCustomerLogin(magentoCustomer) {
        let loginResult = new LoginResult();
        loginResult.customer = CustomerMapper._mapCustomer(magentoCustomer);

        /* TODO
        if (ctResult.body.cart) {
            loginResult.cart = CartMapper._mapCart(ctResult.body.cart);
        }
        */
        return loginResult;
    }

}

module.exports = CustomerMapper;