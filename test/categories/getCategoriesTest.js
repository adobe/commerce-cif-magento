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
const requestConfig = require('../lib/config').requestConfig;
const sampleCategoriesList = require('../resources/sample-categories-list');
const sampleCategoryById = require('../resources/sample-category-by-id');
const sampleCategory404 = require('../resources/sample-category-404');
const sampleCategoriesSorted = require('../resources/sample-categories-sorted');

describe('Magento getCategories', () => {
    describe('Unit Tests', () => {
        setup(this, __dirname, 'getCategories');

        let args;

        beforeEach((() => {
            args = {
                MAGENTO_IGNORE_CATEGORIES_WITH_LEVEL_LOWER_THAN: 2
            };
        }))

        it('Successfully returns the categories as flat structure', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=50&searchCriteria[currentPage]=0', 'GET'),
            ];

            return this.prepareResolve(sampleCategoriesList, expectedArgs).execute(args).then(result => {
                assert.isNotEmpty(result);
                assert.isNotEmpty(result.response);
                assert.strictEqual(result.response.statusCode, 200);
                assert.strictEqual(result.response.body.count, 21);
                assert.strictEqual(result.response.body.total, 21);
                assert.isArray(result.response.body.results);
                assert.strictEqual(result.response.body.results.length, 21);
            });
        });

        it('Successfully returns the categories as tree', () => {
            args.type = 'tree';
            return this.prepareResolve(sampleCategoriesList).execute(args).then(result => {
                assert.isNotEmpty(result);
                assert.isNotEmpty(result.response);
                assert.strictEqual(result.response.statusCode, 200);
                assert.strictEqual(result.response.body.count, 21);
                assert.strictEqual(result.response.body.total, 21);
                assert.isArray(result.response.body.results);
                assert.strictEqual(result.response.body.results.length, 3);
                assert.isNotEmpty(result.response.body.results[0].children);
                assert.strictEqual(result.response.body.results[0].children.length, 6);
            });
        });

        it('Get category by id', () => {

            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/mock-id', 'GET'),
            ];
            args.id = 'mock-id';
            return this.prepareResolve(sampleCategoryById, expectedArgs).execute(args).then(result => {
                assert.isNotEmpty(result);
                assert.isNotEmpty(result.response);
                assert.strictEqual(result.response.statusCode, 200);
                assert.strictEqual(result.response.body.name, 'Equipment');
            });
        });

        it('Return error when a category does not exist', () => {
            args.id = 'mock-id';
            return this.prepareReject(sampleCategory404).execute(args).then(result => {
                assert.isDefined(result.response);
                assert.isDefined(result.response.error);
                assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
            });
        });

        it('Get categories sorted including localization and direction', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=50&searchCriteria[currentPage]=0&searchCriteria[sortOrders][0][field]=name&searchCriteria[sortOrders][0][direction]=asc', 'GET'),
            ];
            args.sort = 'name.asc';
            return this.prepareResolve(sampleCategoriesSorted, expectedArgs).execute(args).then(result => {
                checkNamesAreSorted(result);
            });
        });

        it('Get categories sorted including direction', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=50&searchCriteria[currentPage]=0&searchCriteria[sortOrders][0][field]=name&searchCriteria[sortOrders][0][direction]=asc', 'GET'),
            ];
            args.sort = 'name.asc';
            return this.prepareResolve(sampleCategoriesSorted, expectedArgs).execute(args).then(result => {
                checkNamesAreSorted(result);
            });
        });

        it('Get categories sorted', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=50&searchCriteria[currentPage]=0&searchCriteria[sortOrders][0][field]=name&searchCriteria[sortOrders][0][direction]=asc', 'GET'),
            ];
            args.sort = 'name';
            return this.prepareResolve(sampleCategoriesSorted, expectedArgs).execute(args).then(result => {
                checkNamesAreSorted(result);
            });
        });

        it('Get categories sorted desc', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=50&searchCriteria[currentPage]=0&searchCriteria[sortOrders][0][field]=name&searchCriteria[sortOrders][0][direction]=desc', 'GET'),
            ];
            args.sort = 'name.desc';
            return this.prepareResolve(sampleCategoriesSorted, expectedArgs).execute(args).then(result => {
                assert.isNotEmpty(result);
            });
        });

        it('Get categories with pagination', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[filterGroups][0][filters][0][conditionType]=gt&searchCriteria[pageSize]=10&searchCriteria[currentPage]=1', 'GET'),
            ];
            args.limit = 10;
            args.offset = 10;
            return this.prepareResolve(sampleCategoriesSorted, expectedArgs).execute(args).then(result => {
                assert.isNotEmpty(result);
            });
        });

        it('gets a category by slug', () => {
            const expectedArgs = [
                requestConfig('http://does.not.exist/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=url_path&searchCriteria[filterGroups][0][filters][0][value]=my/category&searchCriteria[filterGroups][0][filters][0][conditionType]=eq', 'GET'),
            ];
            args.slug = 'my/category';
            return this.prepareResolve(sampleCategoryById, expectedArgs).execute(args).then(result => {
                assert.isNotEmpty(result);
                assert.isNotEmpty(result.response);
                assert.strictEqual(result.response.statusCode, 200);
                assert.strictEqual(result.response.body.name, 'Equipment');
            });
        });

        it('returns an error when there is no category for a given slug', () => {
            args.slug = 'my/category';
            return this.prepareReject(sampleCategory404).execute(args).then(result => {
                assert.isDefined(result.response);
                assert.isDefined(result.response.error);
                assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
            });
        });

        function checkNamesAreSorted(result) {
            assert.isNotEmpty(result.response.body.results);
            const names = result.response.body.results.map(category => category.name);
            const sortedNames = JSON.parse(JSON.stringify(names));
            sortedNames.sort();
            assert.deepEqual(names, sortedNames);
        }
    });
});