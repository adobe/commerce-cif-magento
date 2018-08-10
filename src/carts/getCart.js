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
const cartMapper = require('./CartMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;


/**
 * This action gets a cart that exists in magento.
 *
 * @param   {string} args.MAGENTO_HOST           magento project key
 * @param   {string} args.MAGENTO_API_VERSION    magento client id
 *
 * @param   {string} args.id                     the if of a cart
 */
function getCart(args) {
    const validator = new InputValidator(args, ERROR_TYPE);

    validator
        .checkArguments()
        .mandatoryParameter('id');
    if (validator.error) {
        return validator.buildErrorResponse();
    }
    const id = args.id;
    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-aggregated-carts');

    return cart.byId(id).get().catch(error => {
        return cart.handleError(error);
    });

}

module.exports.main = getCart;
