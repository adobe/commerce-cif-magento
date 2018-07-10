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

describe('Magento Common Utils', () => {

    describe('Unit tests', () => {
  
        it('verifies date formatting', () => {
            let formatDate = require(__dirname + '/../../src/common/utils').formatDate;

            // Magento dates do not specifiy the time zone so we explicitly add 'UTC' here
            // Otherwise the CIF formatting may vary depending on the time zone where this test is executed
            // (in RFC3339 / ISO8601 the timezone is always zero UTC offset, as denoted by the suffix "Z")

            let magentoDate = "2018-06-05 10:58:18 UTC";
            let cifDate = formatDate(magentoDate);
            let expectedCifDate = "2018-06-05T10:58:18.000Z";

            assert.strictEqual(cifDate, expectedCifDate);
        });
    });
});
