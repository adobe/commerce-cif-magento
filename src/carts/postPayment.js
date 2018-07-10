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
const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const cartMapper = require('./CartMapper');
const MagentoCartClient = require('./MagentoCartClient');
const PaymentMapper = require('./PaymentMapper');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * Adds a payment to a cart.
 *
 * @param   {string} args.MAGENTO_SCHEMA            magento schema
 * @param   {string} args.MAGENTO_HOST              magento hostname
 * @param   {string} args.MAGENTO_API_VERSION       magento api version
 * @param   {string} args.MAGENTO_AUTH_TOKEN        magento authentication token
 * @param   {string} args.MAGENTO_MEDIA_PATH        magento media base path
 * 
 * @param   {string}  args.id                       cart id
 * @param   {Payment} args.payment                  payment object
 * 
 * @return  {Promise}                               the cart with the payment
 */
function postPayment(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id')
        .mandatoryParameter('payment');
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    let paymentMapper = new PaymentMapper();

    const cart = new MagentoCartClient(args, cartMapper.mapCart, 'guest-carts');
    const data = { 
        "method": paymentMapper._mapToMagentoPayment(args.payment)
    };

    return cart.byId(args.id).updatePayment(data).then(function () {
        return cart.byId(args.id).get();
    }).catch((error) => {
        return cart.handleError(error);
    });

}

module.exports.main = decorateActionForSequence(postPayment);