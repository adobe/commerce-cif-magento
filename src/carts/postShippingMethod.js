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

const MagentoCartClient = require('./MagentoCartClient');
const MagentoAddressHelper = require('./MagentoAddressHelper');
const cartMapper = require('./CartMapper');
const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const has = require('lodash/has');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action sets a cart shipping methods.
 *
 * @param   {string} args.MAGENTO_HOST              Magento hostname
 * @param   {string} args.MAGENTO_SCHEMA            optional Magento schema
 * @param   {string} args.MAGENTO_API_VERSION       optional Magento api version
 * @param   {string} args.MAGENTO_AUTH_ADMIN_TOKEN  optional Magento authentication token
 
 * @param   {string} args.id                        cart id
 * @param   {string} args.shippingMethodId          shipping method identifier
 *
 * @return  {Promise}                               the cart with the shipping method set
 */
function postShippingMethod(args) {

    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('shippingMethodId')
        .matchRegexp('shippingMethodId', /^(\w+?)_(\w+?)$/); // Magento always requieres shipping method & carrier which are concatinated by _
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const id = args.id;
    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-carts');

    // need to get the cart first to check if the shipping address is already set, the shipping address is needed for the POST
    return cart.byId(id).get().then(result => {
        // check if address is pressent in cart and minimun has country set, otherwise Magento will not accept the address
        if (result.response.body && result.response.body.shippingAddress && has(result.response.body.shippingAddress, 'country')) {
            // get the shipping address needed to update the shipping information
            const cartResult = result.response.body;
            const shippingMethods = args.shippingMethodId.split('_');
            const data = {
                addressInformation: {
                    shipping_address: MagentoAddressHelper.mapToMagentoAddress(cartResult.shippingAddress),
                    shipping_method_code: shippingMethods[0],
                    shipping_carrier_code: shippingMethods[1]
                }
            }

            return cart.byId(id).updateShippingInfo(data).then(function () {
                return cart.byId(id).get();
            });
        } else {
            return cart.handleError({statusCode: 400, message: 'The shipping address is missing. Set the address and try again.'});
        }
    }).catch(error => {
        return cart.handleError(error);
    });
}

module.exports.main = postShippingMethod;
