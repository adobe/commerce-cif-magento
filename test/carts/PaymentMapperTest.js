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

const assert = require('chai').assert;
const PaymentMapper = require('../../src/carts/PaymentMapper');
const Payment = require('@adobe/commerce-cif-model').Payment;

describe('Magento PaymentMapper', () => {
    describe('Unit tests', () => {

        let paymentMapper = new PaymentMapper();

        it('returns null if the given payment is undefined', () => {
            assert.isNull(paymentMapper._mapToMagentoPayment(null));
        });

        it('returns an empty payment if the payment is not set yet', () => {
            assert.isNull(paymentMapper._mapPayment([]));
        });

        it('maps a Magento payment to a CIF payment', () => {
            let payment = {
                "method": "creditcard",
                "po_number": 123456,
                "additional_data": []
            };
            let cifPayment = paymentMapper._mapPayment(payment);

            let expected = new Payment();
            expected.method = "creditcard";

            assert.deepEqual(cifPayment, expected);
        });

        it('maps a CIF payment to a Magento payment', () => {
            let cifPayment = new Payment();
            cifPayment.method = 'creditcard';

            let payment = paymentMapper._mapToMagentoPayment(cifPayment);
            assert.deepEqual(payment, {
                "method": "creditcard"
            });
        });

        it('it adds a payment to a partial cart', () => {
            let cart = {};
            let payment = new Payment();
            cart = paymentMapper._fillPayment(payment, cart);
            assert.isDefined(cart.payment);
            assert.deepEqual(cart.payment, payment);
        });

    });
});