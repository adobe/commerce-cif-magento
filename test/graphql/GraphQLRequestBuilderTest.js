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
const requestBuilder = require('../../src/graphql/GraphQlRequestBuilder');

describe('Magento request builder', () => {
    describe('Unit Tests', () => {
        it('returns basic request parameters', function () {
            let endpoint = "end";
            let context = {
                obj: true
            }
            let b = new requestBuilder(endpoint, context);
            let res = b.build();
            assert.deepEqual(res, {
                method: 'POST',
                uri: endpoint,
                body: {
                    query: '{\n}',
                    operationName: null,
                    variables: null
                },
                headers: {
                    'Store': 'default'
                },
                json: true,
                resolveWithFullResponse: true
            });
        });
    });
});