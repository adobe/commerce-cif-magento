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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const MagentoCartClient = require('../carts/MagentoCartClient');
const cartMapper = require('../carts/CartMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

class MagentoCustomerLogin extends MagentoClientBase {

    /**
     * @param   {string} args.MAGENTO_SCHEMA         Magento schema
     * @param   {string} args.MAGENTO_HOST           Magento host key
     * @param   {string} args.MAGENTO_API_VERSION    Magento api version
     */
    constructor(args, customerMapper) {
        super(args, customerMapper, '', ERROR_TYPE);
    }

    login(data) {
        let postData = {
            username: data.email,
            password: data.password
        };
        const cartClient = new MagentoCartClient(this.args, cartMapper.mapCart, 'customer-aggregated-carts');
        return this._customerToken(postData)
            //get a customer token
            .then(token => {
                return token;
            })
            //customer login
            .then(token => {
                cartClient.customerToken = token;
                return this._customerLogin(token);
            })
            //merge the anonymous cart if it has been provided
            .then(loginResult => {
                if (data.anonymousCartId) {
                    return this._mergeCart(cartClient, data.anonymousCartId)
                        //don't need the cart merge result;
                        .then(() => {
                            return loginResult;
                        });
                } else {
                    return loginResult;
                }
            })
            // get the customer cart and add it to login response
            .then(loginResult => {
                return this._customerCart(cartClient, loginResult);
            })
            .catch((error) => {
                return this.handleError(error);
            });
    }

    _customerToken(postData) {
        return this
            .withEndpoint("integration/customer/token")
            ._execute("POST", postData)
    }

    _customerLogin(token) {
        return this.withResetEndpoint("customers/me", 0)
            .withAuthorizationHeader(token)
            ._execute("GET").then( result => {
                return this.mapper(result);
            });
    }

    _customerCart(cartClient, loginResult) {
        let headers = {
            'Set-Cookie': MagentoClientBase.const().CCS_MAGENTO_CUSTOMER_TOKEN + '=' + cartClient.customerToken + ';Path=/;Max-Age=' + this.args.MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME
        };
        // no need to provide the id for a customer cart
        return cartClient.byId().get().then(result => {
            loginResult.cart = result.response.body;
            return this._handleSuccess(loginResult, headers);
        });
    }

    _mergeCart(cartClient, anonymousCartId) {
        // no need to provide the id for a customer cart
        return cartClient.byId().mergeCart(anonymousCartId);
    }

}

module.exports = MagentoCustomerLogin;