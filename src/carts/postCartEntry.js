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
 * @param   {string} args.id                     cart id; when empty a new cart will be created
 * @param   {string} args.productVariantId       id of the product variant
 * @param   {string} args.quantity               quantity for the product variant
 */
// TODO for now we do not support configurable products, a single product variant must be added to the cart
function postCartEntry(args) {

    const validator = new InputValidator(args, ERROR_TYPE);
    let id = args.id;
    const quantity = parseFloat(args.quantity);
    const productVariantId = args.productVariantId;

    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-carts');

    const ActionStateEnum = {
        NEW_EMPTY_CART: 0,
        NEW_CART_AND_ENTRY: 1,
        ADD_ENTRY_2_CART: 2
    };

    let actionState = ActionStateEnum.NEW_EMPTY_CART;

    if (typeof productVariantId !== 'undefined' && productVariantId) {
        actionState = ActionStateEnum.NEW_CART_AND_ENTRY;
    }
    if (typeof id !== 'undefined' && id) {
        actionState = ActionStateEnum.ADD_ENTRY_2_CART;
    }

    validator.checkArguments();
    if (actionState !== ActionStateEnum.NEW_EMPTY_CART) {
        validator.mandatoryParameter('quantity')
            .isInteger('quantity')
            .isInsideInterval('quantity', 1);
    }

    if (validator.error) {
        return validator.buildErrorResponse();
    }

    let data = {};

    switch (actionState) {
        case ActionStateEnum.NEW_EMPTY_CART:
            return cart.create().then(function (result) {
                let id = result.response.body;
                let headers = {'Location': `carts/${id}`};
                return cart.byId(id).get(headers, 201);
            }).catch(error => {
                return cart.handleError(error);
            });
        case ActionStateEnum.ADD_ENTRY_2_CART:
            data.cartItem = {
                quote_id: id,
                sku: productVariantId,
                qty: quantity
            };
            return cart.byId(id).addItem(data).then((result) => {
                let headers = {'Location': `carts/${id}/entries/${result.response.body.item_id}`};
                return cart.byId(id).get(headers, 201);
            }).catch(error => {
                return cart.handleError(error);
            });
        case ActionStateEnum.NEW_CART_AND_ENTRY:
            data.cartItem = {
                sku: productVariantId,
                qty: quantity
            };
            return cart.create().then(function (result) {
                id = data.cartItem.quote_id = result.response.body;
                return cart.byId(id).addItem(data).then((result) => {
                    let headers = {'Location': `carts/${id}/entries/${result.response.body.item_id}`};
                    return cart.byId(id).get(headers, 201);
                });
            }).catch(error => {
                return cart.handleError(error);
            });
    }
}

module.exports.main = decorateActionForSequence(postCartEntry);

