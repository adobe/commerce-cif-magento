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
const responseFilter = require('../../src/graphql/responseFilter');

describe('Graphql responseFilter', () => {
    describe('Unit Tests', () => {
        it('filters a result object to return only the queried fields', () => {
            let query = {
                searchProducts: {
                    results: {
                        prices: {
                            country: true
                        },
                        sku: true,
                        id: true,
                        variants: {
                            available: true
                        }
                    }
                }
            };
            let obj = {
                results: [{
                    prices: [{
                        country: 'CH',
                        amount: 123
                    }],
                    sku: "sku",
                    id: "lol",
                    anotherField: "haha",
                    obj: {
                        wh: "at"
                    },
                    variants: [{
                        sku: "variant",
                        guru: 1
                    }]
                }]
            };

            assert.hasAllKeys(responseFilter.filter(obj, query), query);
        });
    });
});