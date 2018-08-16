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
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * Magento payment methods API implementation.
 */
class MagentoCartPaymentMethodsClient extends MagentoClientBase {

    /**
     * Builds a cart payment methods client for Magento
     *
     * @param args                                  parameters as received from open whisk
     * @param paymentMethodsMapper {Function}       Magento cif cart payment methods mapper handler
     * @param endpoint                              Magento api endpoint
     */
    constructor(args, paymentMethodsMapper, endpoint) {
        super(args, paymentMethodsMapper, endpoint, ERROR_TYPE);
    }

    /**
     * Returns the available payment methods for a cart.
     * 
     * @return {Promise}
     */
    getPaymentMethods() {
        //change the endpoint based on the customer login token
        if (this.customerToken) {
            this.baseEndpoint = 'carts';
        } else {
            this.baseEndpoint = 'guest-carts';
        }
        return this.withEndpoint("payment-methods")._execute('GET').then(result => {
            return this._handleSuccess(this.mapper(result));
        });
    }
}

module.exports = MagentoCartPaymentMethodsClient;