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
const MagentoCartPaymentMethodsClient = require('./MagentoCartPaymentMethodsClient');
const CartPaymentMethodMapper = require('./CartPaymentMethodMapper');
const decorateActionForSequence = require('@adobe/commerce-cif-common/performance-measurement.js').decorateActionForSequence;
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action gets the available payment methods for a cart from Magento.
 *
 * @param   {string} args.MAGENTO_HOST              Magento hostname
 * @param   {string} args.MAGENTO_SCHEMA            optional Magento schema
 * @param   {string} args.MAGENTO_API_VERSION       optional Magento api version
 * @param   {string} args.id                        cart id
 *
 * @return  {Promise}                               the list of payment methods
 */
function getPaymentMethods(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator
        .checkArguments()
        .mandatoryParameter('id');
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const paymentMethods = new MagentoCartPaymentMethodsClient(args, CartPaymentMethodMapper.mapPaymentMethods, 'guest-carts');

    return paymentMethods.byId(args.id).getPaymentMethods().catch(error => {
        return paymentMethods.handleError(error);
    });
}

module.exports.main = decorateActionForSequence(getPaymentMethods);
