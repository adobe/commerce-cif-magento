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
const ProductGraphQlRequestBuilder = require('../../src/products/ProductGraphQlRequestBuilder');

describe('Magento ProductGraphQlRequestBuilder', () => {
    describe('Unit Tests', () => {
        it('parses valid pagination parameters', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                limit: 15,
                offset: 30
            });
            b._parsePagination();

            assert.deepEqual(b.context, {
                pageSize: 15,
                currentPage: 3
            });
        });

        it('falls back to page one for invalid offset parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                limit: 15,
                offset: 2
            });
            b._parsePagination();

            assert.deepEqual(b.context, {
                pageSize: 15,
                currentPage: 1
            });
        });

        it('falls back to the default for a negative limit parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                limit: -1
            });
            b._parsePagination();

            assert.deepEqual(b.context, {
                pageSize: 25,
                currentPage: 1
            });
        });

        it('uses the default if no pagination parameters are set', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {});
            b._parsePagination();

            assert.deepEqual(b.context, {
                pageSize: 25,
                currentPage: 1
            });
        });

        it('parses fulltext search parameter', () => {
            let searchTerm = 'my search term';
            let b = new ProductGraphQlRequestBuilder('', '', {
                text: searchTerm
            });
            b._parseFullTextSearch();

            assert.deepEqual(b.context, {
                search: searchTerm
            });
        });

        it('parses one sorting parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                sort: 'name.desc|'
            });
            b._parseSorting();

            assert.deepEqual(b.context, {
                sort: [
                    {
                        field: 'name',
                        direction: 'DESC'
                    }
                ]
            });
        });

        it('parses two sorting parameters', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                sort: 'name|price.asc'
                //categories.id:"14"|variants.sku:"abc"
            });
            b._parseSorting();

            assert.deepEqual(b.context, {
                sort: [
                    {
                        field: 'name',
                        direction: 'ASC'
                    },
                    {
                        field: 'price',
                        direction: 'ASC'
                    }
                ]
            });
        });

        it('ignores an unknown sort parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                sort: 'description'
            });
            b._parseSorting();

            assert.deepEqual(b.context, {
                sort: []
            });
        });

        it('parses one filter parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                filter: 'categories.id:"14"'
            });
            b._parseFilter();

            assert.deepEqual(b.context, {
                filter: [
                    {
                        field: 'category_id',
                        value: '14'
                    }
                ]
            });
        });

        it('parses two filter parameters', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                filter: 'categories.id:subtree("14")|variants.sku:"abc"'
            });
            b._parseFilter();

            assert.deepEqual(b.context, {
                filter: [
                    {
                        field: 'category_id',
                        value: '14'
                    },
                    {
                        field: 'sku',
                        value: 'abc'
                    }
                ]
            });
        });

        it('parses one filter parameter and ignores a second invalid parameter', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                filter: 'categories.id:"14"|variants.sku'
            });
            b._parseFilter();

            assert.deepEqual(b.context, {
                filter: [
                    {
                        field: 'category_id',
                        value: '14'
                    }
                ]
            });
        });

        it('rejects invalid filter parameters', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                filter: 'categories.subtree:14|bad.filter.sku:"abc|categories.id:14'
            });
            b._parseFilter();

            assert.deepEqual(b.context, {
                filter: []
            });
        });

        it('includes request attributes', () => {
            let b = new ProductGraphQlRequestBuilder('', '', {
                GRAPHQL_PRODUCT_ATTRIBUTES: ["color", "size"]
            });
            b._parseAttributes();

            assert.deepEqual(b.context, {
                attributes: ["color", "size"]
            });
        });
    });
});
