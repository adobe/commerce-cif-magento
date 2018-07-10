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

describe('Magento postShippingAddress', function () {

    describe('Integration tests', function () {

        const addressTests = require('../lib/addressITHelper').tests(this, 'shipping');

        it('returns 400 for updating the shipping address of non existing cart', function () {
            return addressTests.missingCart(addressTests.postAddressPath);
        });

        it('returns 400 for updating the shipping address with no parameters', function () {
            return addressTests.missingCart(addressTests.postAddressPath);
        });

        it('returns 400 for updating the shipping address with no country', function () {
            return addressTests.postAddressWithNoCountry();
        });

        it('creates complete shipping address', function () {
            return addressTests.postAddressSuccess();
        });
    });
});