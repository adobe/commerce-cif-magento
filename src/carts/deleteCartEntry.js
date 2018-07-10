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
const MagentoCart = require('./MagentoCartClient');
const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const cartMapper = require('./CartMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;


/**
 * This action removes a entry from a cart.
 *
 * @param   {string} args.MAGENTO_HOST           magento project key
 * @param   {string} args.MAGENTO_API_VERSION    magento client id
 *
 * @param   {string} args.id                   cart id
 * @param   {string} args.cartEntryId          cart entry id
 *
 * @return  {Promise}                          the cart containing the remaining cart entries
 */
function deleteCartEntry(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('cartEntryId')
        .matchRegexp('cartEntryId', InputValidator.CART_ENTRY_ID_REGEXP);
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const cart = new MagentoCart(args, cartMapper.mapCart, 'guest-carts');
    return cart.deleteItem(args.id, args.cartEntryId).then(function () {
        return cart.byId(args.id).get();
    }).catch(error => {
        return cart.handleError(error);
    });

}

module.exports.main = decorateActionForSequence(deleteCartEntry);
