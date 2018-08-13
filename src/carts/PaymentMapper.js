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

const Payment = require('@adobe/commerce-cif-model').Payment;

class PaymentMapper {

    /**
     * Maps a given CIF Payment object to a Magento payment method.
     * 
     * @param {*} payment CIF payment.
     */
    _mapToMagentoPayment(payment) {
        if (!payment) {
            return null;
        }

        let magentoPayment = {};
        magentoPayment.method = payment.method;

        return magentoPayment;
    }

    /**
     * Maps a Magento payment method to a CIF Payment object.
     * 
     * @param {*} magentoPayment Magento payment method.
     */
    _mapPayment(magentoPayment) {
        // Magento returns [] if no payment method is set yet
        if (magentoPayment instanceof Array) {
            return null;
        }

        let ccifPayment = new Payment.Builder()
            .withId(magentoPayment.method)
            .withMethod(magentoPayment.method)
            .withMethodId(magentoPayment.method)
            .build();

        return ccifPayment;
    }

    /**
     * Adds a CIF Payment object to a partial CIF Cart
     * 
     * @param {*} payment       CIF Payment
     * @param {*} partialCart   Partial CIF Cart
     */
    _fillPayment(payment, partialCart) {
        partialCart.payment = payment;
        partialCart.payments = [ payment ];
        return partialCart;
    }

}

module.exports = PaymentMapper;