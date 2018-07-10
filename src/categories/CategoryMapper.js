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

const Category = require('@adobe/commerce-cif-model').Category;
const PagedResponse = require('@adobe/commerce-cif-model').PagedResponse;
const formatDate = require('@adobe/commerce-cif-magento-common/utils').formatDate;

/**
 * Utility class to map Magento categories to CCIF categories.
 */
class CategoryMapper {

    /**
     * Maps a Magento categories response to a PagedResponse.
     * If the type parameter is 'flat', the count property of the paged response is equal to the size of the results array.
     * If the type parameter is 'tree', the count property of the paged response is equal to the total number of
     * categories of the results array recursively including all sub-categories defined in all categories.
     *
     * @param magentoResponse              JSON object returned by the Magento categories search.
     * @param type                         The type of the returned category structure, valid values are 'flat' (default) or 'tree'.
     * @param depth                        If type equals 'tree', the depth defins the maximum depth of the returned category tree(s).
     * @returns {PagedResponse}            A paged response with products.
     */
    static mapPagedCategoryResponse(magentoResponse, type = 'flat', depth, ignoreCategoresWithLevelLowerThan) {

        // if depth is defined, exclude "too deep" categories from the magento results
        if (depth >= 0 && magentoResponse.items) {
            // Level in magento categories do not start from 0. 0 is the Root category and there may bo some default categories.
            // In order to skip those we have a configuration which tells us how many levels should be skipped.
            magentoResponse.items = magentoResponse.items.filter(cat => cat.level <= (depth + ignoreCategoresWithLevelLowerThan));
        }

        let pagedResponse = new PagedResponse();

        pagedResponse.results = (type === 'tree') ?
            CategoryMapper._mapCategoriesTree(magentoResponse, ignoreCategoresWithLevelLowerThan) :
            CategoryMapper._mapCategories(magentoResponse, ignoreCategoresWithLevelLowerThan);
        pagedResponse.count = magentoResponse.items.length;
        pagedResponse.total = magentoResponse.total_count;
        if (magentoResponse.search_criteria.current_page && magentoResponse.search_criteria.page_size) {
            pagedResponse.offset = magentoResponse.search_criteria.current_page * magentoResponse.search_criteria.page_size;
        } else {
            pagedResponse.offset = 0;
        }
        return pagedResponse;
    }

    /**
     * Maps an array of Magento categories to a tree of CCIF categories.
     * The result can contain multiple disjoint trees if the product catalog has multiple root categories or with paginated results.
     *
     * @private
     * @param magentoResponse       JSON object returned by the Magento categories search.
     * @returns {Category[]}        An array of CCIF categories.
     */
    static _mapCategoriesTree(magentoResponse, ignoreCategoresWithLevelLowerThan) {
        let categories = CategoryMapper._mapCategories(magentoResponse, ignoreCategoresWithLevelLowerThan);

        let categoryMap = new Map();
        categories.forEach(cat => categoryMap.set(cat.id, cat));

        // when paging is enabled, orphans are categories for which the parent is missing
        // because it's not included in that paged response
        let orphans = [];

        for (let cat of categoryMap.values()) {
            if (cat.parentCategories) {
                // in Magento, a category only has one parent
                let parentId = cat.parentCategories[0].id;
                if (categoryMap.has(parentId)) {
                    let parent = categoryMap.get(parentId);
                    if (!parent.subCategories) {
                        parent.subCategories = [];
                    }
                    parent.subCategories.push(cat);
                } else {
                    orphans.push(cat);
                }
            }
        }

        return categories.filter(cat => !cat.parentCategories).concat(orphans);
    }

    /**
     * Maps an array of Magento categories to an array of CCIF categories
     *
     * @private
     * @param magentoResponse       JSON object returned by the Magento categories search.
     * @returns {Category[]}        An array of CCIF categories.
     */
    static _mapCategories(magentoResponse, ignoreCategoresWithLevelLowerThan) {
        return magentoResponse.items.map(category => {
            return CategoryMapper.mapCategory(category, ignoreCategoresWithLevelLowerThan);
        });
    }

    static mapCategory(magentoCategory, ignoreCategoresWithLevelLowerThan) {
        let category = new Category(magentoCategory.id + '');
        category.name = {
            en: magentoCategory.name
        };
        category.description = undefined; // This is unavailable in magento response.
        // TODO: Check if it is supported and the info is missing, or it just does not exist

        if (magentoCategory.level && magentoCategory.level > ignoreCategoresWithLevelLowerThan) {
            // TODO: Use level here instead of parent id. Doh!
            let parentCategory = new Category(magentoCategory.parent_id + '');
            category.parentCategories = [parentCategory];
        }

        if (magentoCategory.created_at) {
            category.createdDate = formatDate(magentoCategory.created_at);
        }
        if (magentoCategory.updated_at) {
            category.lastModifiedDate = formatDate(magentoCategory.updated_at);
        }

        return category;
    }
}

module.exports = CategoryMapper;