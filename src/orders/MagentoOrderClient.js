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
 * Magento Order API client.
 */
class MagentoOrderClient extends MagentoClientBase {

    /**
     * Builds an order client for Magento.
     *
     * @param args                      parameters as received from open whisk
     * @param orderMapper {Function}    Magento cif order mapper handler
     * @param endpoint                  api endpoint
     */
    constructor(args, orderMapper, endpoint) {
        super(args, orderMapper, endpoint, ERROR_TYPE);
    }

    /**
     * Creates an order from a cart.
     */
    create(cartId) {
        return this.withEndpointBasedOnCustomer(cartId)._execute('PUT').then(result => {
            let ccifOrder = this.mapper(result);
            let headers = {'Location': `orders/${ccifOrder.id}`};
            return this._handleSuccess(ccifOrder, headers, 201);
        }).catch(error => {
            return this.handleError(error);
        });
    }

    withEndpointBasedOnCustomer(cartId) {
        if (this.customerToken) {
            this.endpoint = 'carts/mine/order';
        } else {
            this.baseEndpoint = `guest-carts/${cartId}/order`;
        }
        return this;
    }

}

module.exports = MagentoOrderClient;