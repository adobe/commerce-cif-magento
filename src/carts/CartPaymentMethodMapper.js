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

const PaymentMethod = require('@adobe/commerce-cif-model').PaymentMethod;

/**
 * Utility class to map Magento objects to CIF objects.
 */
class CartPaymentMethodMapper {

    /**
     * Maps an array of Magento payment methods to an array of CIF payment methods
     *
     * @param magentoPaymentMethods        JSON array of Magento payment methods.
     * @returns {PaymentMethod[]}          An array of CIF payment methods.
     */
    static mapPaymentMethods(magentoPaymentMethods) {
        if (magentoPaymentMethods instanceof Array) {
            return magentoPaymentMethods.map(magentoPaymentMethod => CartPaymentMethodMapper._mapPaymentMethod(magentoPaymentMethod));
        } else { // we have a unexpected result from Magento and can not map it.
            return [];
        }
    }

    /**
     * @private
     */
    static _mapPaymentMethod(magentoPaymentMethod) {
        let paymentMethod = new PaymentMethod.Builder()
            .withId(magentoPaymentMethod.code)
            .withName(magentoPaymentMethod.title)
            .build();

        return paymentMethod;
    }
}

module.exports = CartPaymentMethodMapper;
