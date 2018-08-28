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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

class MagentoCategories extends MagentoClientBase {
    
    constructor(args, categoriesMapper, endpoint) {
        super(args, categoriesMapper, endpoint, ERROR_TYPE);
        this.currentSortIndex = 0;
        //undefine the customer token to make sure we are not using for categories requests.
        //this might be a bug on this endpoint
        this.customerToken = undefined;
    }
    
    getCategories(type, depth) {
        this.currentSortIndex = 0;
        return this._execute('GET').then(result => {
            const mapperArgs = [result];
            if (!this.args.id) {
                mapperArgs.push(type);
                mapperArgs.push(depth);
            }
            mapperArgs.push(this.args.MAGENTO_IGNORE_CATEGORIES_WITH_LEVEL_LOWER_THAN);

            const mappedResponse = this.mapper.apply(this, mapperArgs);

            return this._handleSuccess(mappedResponse);
        }).catch(error => {
            return this.handleError(error);
        });
    }
    
    list() {
        const filterCategoriesOnLevel = this.args.MAGENTO_IGNORE_CATEGORIES_WITH_LEVEL_LOWER_THAN - 1;
        this.withEndpoint('list').withQueryString(`searchCriteria[filterGroups][0][filters][0][field]=level&searchCriteria[filterGroups][0][filters][0][value]=${filterCategoriesOnLevel}&searchCriteria[filterGroups][0][filters][0][conditionType]=gt`);
    }
    
    perPage(limit) {
        this.withQueryString(`searchCriteria[pageSize]=${limit}`);
    }
    
    page(offset) {
        this.withQueryString(`searchCriteria[currentPage]=${offset}`);
    }

    sort(field, direction) {
        this.withQueryString(`searchCriteria[sortOrders][${this.currentSortIndex}][field]=${field}`);
        this.withQueryString(`searchCriteria[sortOrders][${this.currentSortIndex}][direction]=${direction}`);
        this.currentSortIndex++;
    }
}

module.exports = MagentoCategories;