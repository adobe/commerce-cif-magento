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

const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const MagentoCartShippingMethodsClient = require('./MagentoCartShippingMethodsClient');
const MagentoCartClient = require('./MagentoCartClient');
const CartMapper = require('./CartMapper');
const CartShippingMethodMapper = require('./CartShippingMethodMapper');
const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action gets the available shipping methods for a cart from Magento.
 *
 * @param   {string} args.MAGENTO_HOST              Magento hostname
 * @param   {string} args.MAGENTO_SCHEMA            optional Magento schema
 * @param   {string} args.MAGENTO_API_VERSION       optional Magento api version
 * @param   {string} args.MAGENTO_AUTH_TOKEN        optional Magento authentication token
 * 
 * @param   {string}  args.id                       cart id
 * 
 * @return  {Promise}                               the list of shipping methods
 */
function getShippingMethods(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id');
    if (validator.error) {
        return validator.buildErrorResponse();
    }
    
    const cart = new MagentoCartClient(args, CartMapper.mapCart, 'guest-carts');
    const shippingMethods = new MagentoCartShippingMethodsClient(args, CartShippingMethodMapper.mapShippingMethods, 'guest-carts');

    // need to get the cart first to check if the shipping address is already set, the shipping address is needed for the POST
    return cart.byId(args.id).get().then(result => {
        if (result.response.body && result.response.body.shippingAddress) {
            // get the address needed for the estimate-shipping-methods call
            const cartResult = result.response.body;
            return shippingMethods.byId(args.id).getShippingMethods(cartResult.shippingAddress, cartResult.currency)
        } else {
            return shippingMethods._handleSuccess([]);
        }
    }).catch(error => {
        return cart.handleError(error);
    });
}

module.exports.main = decorateActionForSequence(getShippingMethods);
