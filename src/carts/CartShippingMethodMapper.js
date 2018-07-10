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

const ShippingMethod = require('@adobe/commerce-cif-model').ShippingMethod;
const Price = require('@adobe/commerce-cif-model').Price;

/**
 * Utility class to map Magento objects to CIF objects.
 */
class CartShippingMethodMapper {

    /**
     * Maps an array of Magento shipping methods to an array of CIF shipping methods
     *
     * @param magentoShippingMethods        JSON array of Magento shipping methods.
     * @returns {ShippingMethod[]}          An array of CIF shipping methods.
     */
    static mapShippingMethods(magentoShippingMethods, currency) {
        if (magentoShippingMethods instanceof Array) {
            return magentoShippingMethods.map(magentoShippingMethod => CartShippingMethodMapper._mapShippingMethod(magentoShippingMethod, currency));
        } else { // we have a unexpected result from Magento and can not map it.
            return [];
        }
    }

    /**
     * @private
     */
    static _mapShippingMethod(magentoShippingMethod, currency) {
        let shippingMethod = new ShippingMethod(magentoShippingMethod.method_code + '_' + magentoShippingMethod.carrier_code);
        shippingMethod.name = magentoShippingMethod.method_title;
        shippingMethod.description = magentoShippingMethod.carrier_title;
        shippingMethod.price = new Price(magentoShippingMethod.amount * 100, currency);
        return shippingMethod;
    }
}

module.exports = CartShippingMethodMapper;