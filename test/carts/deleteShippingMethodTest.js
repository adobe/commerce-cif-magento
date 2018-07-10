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
const setup = require('../lib/setupTest').setup;

describe('Magento deleteShippingMethod', () => {
    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'deleteShippingMethod');

        it('returns a not implemented error', () => {
            return this.execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'NotImplementedError');
            });
        });

    });
});