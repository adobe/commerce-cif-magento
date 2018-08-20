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
const cartMapper = require('./CartMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;


/**
 * This action adds a coupon to a cart.
 *
 * @param   {string} args.MAGENTO_HOST           magento project key
 * @param   {string} args.MAGENTO_API_VERSION    magento client id
 *
 * @param   {string} args.id                     the id of the cart for which the coupon will be added
 * @param   {string} args.code                   the code of the coupon that will be added

 * @return  {Promise}                            the cart after adding the coupon
 */
function postCoupon(args) {
    const validator = new InputValidator(args, ERROR_TYPE)
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('code');

    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const cart = new MagentoCart(args, cartMapper.mapCart, 'guest-carts');
    return cart.byId(args.id).addCoupon(args.code).then(function () {
        return cart.byId(args.id).get();
    }).catch(error => {
        return cart.handleError(error);
    });
}

module.exports.main = postCoupon;
