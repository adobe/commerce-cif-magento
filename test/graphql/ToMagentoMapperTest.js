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
const ToMagentoMapper = require('../../src/graphql/lib/ToMagentoMapper');

describe('Magento Mapper', () => {
    describe('Unit Tests', () => {
        it('correctly replaces all instances of an expression with another one', () => {
            let b = new ToMagentoMapper('', new Map([["cat", "dog"], ["coffee", "tee - since it's better than coffee -"]]), '', '', '');
            let res = b.renameFields("The cats are playing in the park and drinking coffee. I always wanted to have a cat");
            assert.strictEqual(res, "The dogs are playing in the park and drinking tee - since it's better than coffee -. I always wanted to have a dog")
        });

        it('handles singleFields correctly', () => {
            let b = new ToMagentoMapper(['name', 'address', 'phone'], '', [], [], []);
            let requestedSfObj = b.addFields(
                {
                    rootField: {
                        results: {
                            name: true,
                            phone: true
                        }
                    }
                }
            );
            assert.hasAllKeys(requestedSfObj.rootField.results, ["simpleFields"]);
            let requestedSf = requestedSfObj.rootField.results.simpleFields;
            assert.isArray(requestedSf);
            assert.lengthOf(requestedSf, 2);

            let noSfObj = b.addFields(
                {
                    rootField: {
                        results: {
                            zuzu: true,
                            sf: true
                        }
                    }
                }
            );
            assert.containsAllKeys(noSfObj.rootField.results, ["simpleFields"]);
            let noSf = noSfObj.rootField.results.simpleFields;
            assert.isArray(noSf);
            assert.lengthOf(noSf, 0);
        });

        it('handles variants correctly', () => {
            let obj = {
                id: true,
                variants: {
                    attributes: {
                        name: true,
                        value: true
                    },
                    available: true
                }
            };
            let parser = new ToMagentoMapper(['sku'], '', ['atts']);
            parser._addFields(obj);
            assert.hasAllKeys(obj, ['variants', 'configurable_options', 'simpleFields']);
            assert.hasAllKeys(obj.variants, "simpleFields");
            assert.isArray(obj.variants.simpleFields);
            assert.lengthOf(obj.variants.simpleFields, 2);
        });

        it('handles assets correctly', () => {
            let obj = {
                simpleFields: [],
                assets: {
                    id: true,
                    name: true,
                    whatever: true
                }
            };
            let parser = new ToMagentoMapper(['sku'], '', '', ['asset']);
            parser._addAssets(obj);
            assert.hasAllKeys(obj, "simpleFields");
            assert.isArray(obj.simpleFields);
            assert.lengthOf(obj.simpleFields, 1);
        });

        it('handles prices correctly', () => {
            let obj = {
                simpleFields: [],
                prices: {
                    country: true,
                    amount: true
                }
            };
            let parser = new ToMagentoMapper(['sku'], '', '', ['asset']);
            parser._addPrice(obj);
            assert.hasAllKeys(obj, ["simpleFields", "priceFields"]);
            assert.isArray(obj.priceFields);
            assert.lengthOf(obj.priceFields, 2);
        });

        it('handles categories correctly', () => {
            let obj = {
                simpleFields: [],
                categories: {
                    id: true,
                    name: true,
                    whatever: true,
                    children: {
                        name: true
                    }
                }
            };
            let parser = new ToMagentoMapper(['name'], '', '', ['asset'], ['id']);
            parser._addCategories(obj);
            assert.hasAllKeys(obj, ["simpleFields", "categories"]);
            assert.hasAllKeys(obj.categories, ['simpleFields','id', 'name', 'whatever', 'children']);
            //assert.hasAllKeys(obj.categories, ['simpleFields', 'whatever', 'children']); //with new ProductMapper
            assert.lengthOf(obj.categories.simpleFields, 1); //2 with new ProductMapper
            //assert.hasAllKeys(obj.categories.children, 'simpleFields', ); //with new ProductMapper
        });

        it('handles masterVariantId query', () => {
            let parser = new ToMagentoMapper(['sku'], '', '', ['asset']);
            let obj = {
                masterVariantId: true
            };
            parser._addFields(obj);
            assert.hasAllKeys(obj, ["simpleFields", "variants"]);
        });
    });
});