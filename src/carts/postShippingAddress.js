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

const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const MagentoCartClient = require('./MagentoCartClient');
const MagentoAddressHelper = require('./MagentoAddressHelper');
const cartMapper = require('./CartMapper');
const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action sets a cart shipping address.
 *
 * @param   {string}  args.MAGENTO_HOST        magento project key
 * @param   {string}  args.id                  cart id
 * @param   {Address} args.address             a CIF address object
 * @param   {Address} args.default_method      the Magento default shipping method code
 * @param   {Address} args.default_carrier     the Magento default shipping carrier code
 *
 * @return  {Promise}                          the cart with the shipping address
 */
function postShippingAddress(args) {
    
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('address')
        .mandatoryParameter('default_method')
        .mandatoryParameter('default_carrier');
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const addressValidator = new InputValidator(args.address);
    addressValidator
        .checkArguments()
        .atLeastOneParameter(['title', 'salutation', 'firstName', 'lastName', 'email', 'phone', 'mobile',
            'fax', 'country', 'region', 'city', 'postalCode', 'organizationName', 'department',
            'streetNumber', 'streetName', 'additionalStreetInfo', 'additionalAddressInfo']);
    if (addressValidator.error) {
        return addressValidator.buildErrorResponse();
    }

    const id = args.id;
    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-carts');
    const data = {
        addressInformation : {
            shipping_address: MagentoAddressHelper.mapToMagentoAddress(args.address),
            // Magento always requieres shipping method & carrier to be set when posting shipping information
            shipping_method_code: args.default_method,
            shipping_carrier_code: args.default_carrier
        }
    }

    return cart.byId(id).updateShippingInfo(data).then(function () {
        return cart.byId(id).get();
    }).catch((error) => {
        return cart.handleError(error);
    });
}

module.exports.main = decorateActionForSequence(postShippingAddress);
