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
const utils = require('../lib/utils');
const sampleCategories = require('../resources/sample-categories-list');

describe('Magento CategoriesMapper', () => {

    let mapper = utils.getPathForAction(__dirname, 'CategoryMapper');
    let formatDate = require(mapper.replace('CategoryMapper', 'node_modules/@adobe/commerce-cif-magento-common/utils')).formatDate;
    const CategoryMapper = require(mapper);
    const ignoreCategoriesWithLevelLowerThan = 2;

    describe('Unit tests', () => {
        let categoriesData = null;

        beforeEach(() => {
            // clone original sample data before each test
            categoriesData = utils.clone(sampleCategories);
        });
        
        it('Map a single category which does not have a parent', () => {
            let magentoCategory = categoriesData.items[0];
            const mappedCategory = CategoryMapper.mapCategory(magentoCategory, ignoreCategoriesWithLevelLowerThan);
            assert.isNotNull(mappedCategory);

            assert.strictEqual(mappedCategory.id, "3");

            assert.isNotNull(mappedCategory.name);
            assert.strictEqual(mappedCategory.name, "Equipment");

            assert.strictEqual(mappedCategory.createdAt, formatDate(magentoCategory.created_at));
            assert.strictEqual(mappedCategory.lastModifiedAt, formatDate(magentoCategory.updated_at));

            assert.isUndefined(mappedCategory.parents);
        });

        it('Map a single category which has a parent category', () => {
            let magentoCategory = categoriesData.items[3];
            const mappedCategory = CategoryMapper.mapCategory(magentoCategory, ignoreCategoriesWithLevelLowerThan);
            assert.isNotNull(mappedCategory);

            assert.strictEqual(mappedCategory.id, "4");

            assert.isNotNull(mappedCategory.name);
            assert.strictEqual(mappedCategory.name, "Running");

            assert.strictEqual(mappedCategory.createdAt, formatDate(magentoCategory.created_at));
            assert.strictEqual(mappedCategory.lastModifiedAt, formatDate(magentoCategory.updated_at));

            assert.isArray(mappedCategory.parents);
            assert.strictEqual(mappedCategory.parents.length, 1);
            assert.strictEqual(mappedCategory.parents[0].id, "3");
        });

        it('Map multiple categories in a paged response which contains all categories.', () => {
            const mappedCategories = CategoryMapper.mapPagedCategoryResponse(categoriesData, 'flat', undefined, ignoreCategoriesWithLevelLowerThan);

            assert.strictEqual(mappedCategories.offset, 0);
            assert.strictEqual(mappedCategories.count, 21);
            assert.strictEqual(mappedCategories.total, 21);
            assert.isArray(mappedCategories.results);
            assert.strictEqual(mappedCategories.results.length, 21);

            mappedCategories.results.forEach(mappedCategory => {
                assert.isNotEmpty(mappedCategory.name);
                assert.isNotEmpty(mappedCategory.id);
            });
        });

        it('Map multiple categories in a paged response which has pagination information', () => {
            categoriesData.items.length = 10;
            categoriesData.search_criteria.current_page = 1;
            categoriesData.search_criteria.page_size = 10;
            
            const mappedCategories = CategoryMapper.mapPagedCategoryResponse(categoriesData, 'flat', undefined, ignoreCategoriesWithLevelLowerThan);

            assert.strictEqual(mappedCategories.offset, 10);
            assert.strictEqual(mappedCategories.count, 10);
            assert.strictEqual(mappedCategories.total, 21);
            assert.isArray(mappedCategories.results);
            assert.strictEqual(mappedCategories.results.length, 10);
        });

        it('Map multiple categories and ask for the tree representation', () => {
            const mappedCategories = CategoryMapper.mapPagedCategoryResponse(categoriesData, 'tree', undefined, ignoreCategoriesWithLevelLowerThan);

            assert.strictEqual(mappedCategories.offset, 0);
            assert.strictEqual(mappedCategories.count, 21);
            assert.strictEqual(mappedCategories.total, 21);
            assert.isArray(mappedCategories.results);
            assert.strictEqual(mappedCategories.results.length, 3);

            const firstCategory = mappedCategories.results[0];
            assert.isArray(firstCategory.children);
            assert.strictEqual(firstCategory.children.length, 6);
            firstCategory.children.forEach(subCategory => {
                assert.strictEqual(subCategory.parents[0].id, firstCategory.id);
            });
        });

        it('Map multiple categories and make sure parents are set', () => {
            const mappedCategories = CategoryMapper.mapPagedCategoryResponse(categoriesData, 'flat', undefined, ignoreCategoriesWithLevelLowerThan);
            assert.isNotEmpty(mappedCategories.results);
            assert.isUndefined(mappedCategories.results[0].parents);
            assert.isUndefined(mappedCategories.results[1].parents);
            assert.isUndefined(mappedCategories.results[2].parents);
            for (let i = 3; i < mappedCategories.results.length; ++i) {
                assert.isArray(mappedCategories.results[i].parents);
                assert.strictEqual(mappedCategories.results[i].parents.length, 1);
            }
        });

        it('maps a category url_path to a slug', () => {
            const category = categoriesData.items.find(v => v.id === 7);
            const mappedCategory = CategoryMapper.mapCategory(category, ignoreCategoriesWithLevelLowerThan);

            assert.strictEqual(mappedCategory.slug, "women/pants");
        });

        it('maps a category without a url_path', () => {
            const category = categoriesData.items.find(v => v.id === 7);
            // Remove url_path attribute
            category.custom_attributes = category.custom_attributes.filter(o => o.attribute_code !== 'url_path');

            const mappedCategory = CategoryMapper.mapCategory(category, ignoreCategoriesWithLevelLowerThan);

            assert.isUndefined(mappedCategory.slug);
        });

    });
});
