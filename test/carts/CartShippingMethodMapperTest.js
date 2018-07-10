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
const sampleShippingMethodsFile = require('../resources/sample-shippingmethods');
const utils = require('../lib/utils');

describe('Magento CartShippingMethodMapper', () => {

    let action = utils.getPathForAction(__dirname, 'CartShippingMethodMapper');
    let cartShippingMethodMapper = require(action);

    describe('Unit tests', () => {

        let sampleShippingMethods = null;

        beforeEach(() => {
            // clone original sample data before each test
            sampleShippingMethods = JSON.parse(JSON.stringify(sampleShippingMethodsFile));
        });

        it('succeeds if shipping methods are mapped', () => {
            let mappedShippingMethods = cartShippingMethodMapper.mapShippingMethods(sampleShippingMethods);
            assert.isDefined(mappedShippingMethods);
            assert.isArray(mappedShippingMethods);
            assert.lengthOf(mappedShippingMethods, sampleShippingMethods.length);

            mappedShippingMethods.forEach(shippingMethod => {
                assert.containsAllKeys(shippingMethod, ['id', 'name', 'description', 'price']);
                assert.include(shippingMethod.id, '_');
            });
        });

        it('succeeds with empty array result', () => {
            sampleShippingMethods = { invalid: "result" };
            let mappedShippingMethods = cartShippingMethodMapper.mapShippingMethods(sampleShippingMethods);
            assert.isDefined(mappedShippingMethods);
            assert.isArray(mappedShippingMethods);
            assert.lengthOf(mappedShippingMethods, 0);
        });
    });
});
