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

const cutIndex = __dirname.indexOf('test');
const path = __dirname.substring(0, cutIndex) + 'src/graphql';
const handlebars = require('handlebars');
handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
const fs = require('fs');
const assert = require('chai').assert;
const {categoryQuery, priceQuery, placesArgsCorrectlyQuery, offsetQuery, countQuery, totalQuery, simpleQuery, noResultsQuery, simpleVariants, conf_options} = require('../resources/magentoQueries');

describe('Magento graphql templates', () => {

    let productTemplate = fs.readFileSync(path + '/magentoProduct.graphql', 'utf8');
    handlebars.registerPartial("product", productTemplate)
    let queryTemplate = fs.readFileSync(path + '/query.graphql', 'utf8');
    let compiledTemplate = handlebars.compile(queryTemplate);

    describe('Unit Tests', () => {
        let queryObj;
        let sf = ['jackets', 'shirts', 'pants', 'dress'];
        let str = '';
        sf.forEach((s) => {
            str = str + s;
        });

        beforeEach(() => {
            queryObj = {
                searchProducts: {
                    args: {}
                }
            };
        });

        it('creates valid query without queried for results', () => {
            let sp = queryObj.searchProducts;
            sp.total = sp.count = sp.offset = true;

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), noResultsQuery.replace(/\s/g, ""));
        });

        it('creates valid query for total field', () => {
            queryObj.searchProducts.total = true;

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), totalQuery.replace(/\s/g, ""));
        });

        it('creates valid query count field', () => {
            queryObj.searchProducts.count = true;

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), countQuery.replace(/\s/g, ""));
        });

        it('creates valid query for offset field', () => {
            queryObj.searchProducts.offset = true;

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), offsetQuery.replace(/\s/g, ""));
        });

        it('places arguments correctly', () => {
            let text = "ik hou van honden";
            let limit = 39;
            let currentPage = 4;
            queryObj.searchProducts.args = {
                text: text,
                limit: limit,
                currentPage: currentPage
            }
            let query = compiledTemplate(queryObj);

            assert.strictEqual(query.replace(/\s/g, ""), placesArgsCorrectlyQuery.replace(/\s/g, ""));
        });

        it('creates only simpleFields results query', () => {
            queryObj.searchProducts.results = {
                simpleFields: sf
            };

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), simpleQuery.replace(/\s/g, ""));
        });

        it('creates variants with simpleFields query', () => {
            queryObj.searchProducts.results = {
                variants: {
                    simpleFields: sf
                }
            };

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), simpleVariants.replace(/\s/g, ""));
        });

        it('creates configurable options query', () => {
            queryObj.searchProducts.results = {
                variants: {
                    simpleFields: sf
                },
                configurable_options: true
            };

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), conf_options.replace(/\s/g, ""));
        });

        it('handles price query', () => {
            queryObj.searchProducts.results = {
                price: sf
            };

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), priceQuery.replace(/\s/g, ""));
        });

        it('handles categories query', () => {
            queryObj.searchProducts.results = {
                categories: {
                    simpleFields: sf,
                }
            };

            let query = compiledTemplate(queryObj);
            assert.strictEqual(query.replace(/\s/g, ""), categoryQuery.replace(/\s/g, ""));
        });
    });
});