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
const OrderMapper = require('../../src/orders/OrderMapper');
const Order = require('@adobe/commerce-cif-model').Order;

describe('Magento OrderMapper', () => {
    describe('Unit tests', () => {

        let orderMapper = new OrderMapper();

        it('returns null if the given order is undefined', () => {
            assert.isNull(orderMapper._mapOrder(null));
        });

        it('maps a Magento order to a CIF order', () => {
            let response = "12";
            let expectedOrder = new Order();
            expectedOrder.id = 12;

            let order = orderMapper._mapOrder(response);
            assert.deepEqual(order, expectedOrder);
        });

        it('maps a Magento order with a quoted id to a CIF order', () => {
            let response = '"12"';
            let expectedOrder = new Order();
            expectedOrder.id = 12;

            let order = orderMapper._mapOrder(response);
            assert.deepEqual(order, expectedOrder);
        });

        it('returns null if the given order id is invalid', () => {
            assert.isNull(orderMapper._mapOrder('"-12"'));
        });

    });
});
