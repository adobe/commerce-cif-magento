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
const respondWithServiceError = require('../../src/common/web-response-utils').respondWithServiceError;

describe('Magento Common Web Response Utils', () => {

    describe('Unit tests', () => {
  
        it('returns the activation id in debug mode.', () => {

            let args = {
                DEBUG: 1
            };
            let id = 'testId';
            process.env.__OW_ACTIVATION_ID = id;

            return respondWithServiceError(null, args, Promise.resolve.bind(Promise), null).then((res) => {
                assert.isDefined(res.response.headers);
                assert.isDefined(res.response.headers['OW-Activation-Id']);
                assert.equal(res.response.headers['OW-Activation-Id'], id);
            });
        });

    });
});