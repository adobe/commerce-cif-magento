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
const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const cartMapper = require('./CartMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action adds a new entry to a cart. When the cart id is empty a new cart will be created with the new cart entry.
 *
 * @param   {string} args.MAGENTO_HOST           magento project key
 * @param   {string} args.MAGENTO_API_VERSION    magento client id
 *
 * @param   {string} args.id                   cart id;
 * @param   {string} args.cartEntryId          cart entry id;
 * @param   {string} args.quantity             quantity for the product variant
 */
function putCartEntry(args) {

    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('cartEntryId')
        .mandatoryParameter('quantity')
        .isInteger('quantity')
        .isInsideInterval('quantity', 0);
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-carts');

    //delete the entry if quantity is 0. this is only temporary solution and will be removed once
    //Magento fixes the implementation to remove the entry when quantity eq 0.
    if ( parseFloat(args.quantity) === 0 ) {
        return cart.byId(args.id).deleteItem(args.cartEntryId).then(function () {
            return cart.byId(args.id).get();
        }).catch(error => {
            return cart.handleError(error);
        });
    }

    // cart data for cart update action
    const data = {
        cartItem: {
            quote_id: args.id,
            qty: args.quantity
        }
    };

    return cart.byId(args.id).updateItem(args.cartEntryId, data).then(function () {
        return cart.byId(args.id).get();
    }).catch(error => {
        return cart.handleError(error);
    });  
}

module.exports.main = decorateActionForSequence(putCartEntry);
