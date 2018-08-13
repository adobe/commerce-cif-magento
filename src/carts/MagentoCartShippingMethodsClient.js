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
const MagentoAddressHelper = require('./MagentoAddressHelper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * Magento shipping methods API implementation.
 */
class MagentoCartShippingMethodsClient extends MagentoClientBase {

    /**
     * Builds a cart shipping methods client for Magento
     *
     * @param args                                  parameters as received from open whisk
     * @param shippingMethodsMapper {Function}      Magento cif cart shipping methods mapper handler
     * @param endpoint                              Magento api endpoint
     */
    constructor(args, shippingMethodsMapper, endpoint) {
        super(args, shippingMethodsMapper, endpoint, ERROR_TYPE);
    }

    /**
     * Returns the available shipping methods for a cart.
     * 
     * @param address         The CIF shipping address.
     *
     * @return {Promise}
     */
    getShippingMethods(address, currency) {
        //change the endpoint based on the customer login token
        if (this.customerToken) {
            this.baseEndpoint = 'carts';
        } else {
            this.baseEndpoint = 'guest-carts';
        }
        // get the address needed for the estimate-shipping-methods call
        let data = { address: MagentoAddressHelper.mapToMagentoAddress(address) };
        return this.withEndpoint("estimate-shipping-methods")._execute('POST', data).then(result => {
            return this._handleSuccess(this.mapper(result, currency));
        });
    }
}

module.exports = MagentoCartShippingMethodsClient;