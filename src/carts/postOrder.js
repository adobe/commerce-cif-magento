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
const MagentoCartClient = require('./MagentoCartClient');
const OrderMapper = require('./OrderMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * Creates an order from a cart.
 *
 * @param   {string} args.MAGENTO_SCHEMA            Magento schema
 * @param   {string} args.MAGENTO_HOST              Magento hostname
 * @param   {string} args.MAGENTO_API_VERSION       Magento api version
 * @param   {string} args.MAGENTO_AUTH_ADMIN_TOKEN  Magento authentication token
 * @param   {string} args.MAGENTO_MEDIA_PATH        Magento media base path
 * 
 * @param   {string} args.cartId                    cart id from which the order is created
 * 
 * @return  {Promise}                               the order id
 */
function postOrder(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('cartId');
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    let mapper = new OrderMapper();
    const cart = new MagentoCartClient(args, mapper._mapOrder, 'order');

    return cart.byId(args.cartId).order().catch(error => {
        return cart.handleError(error);
    });
}

module.exports.main = postOrder;