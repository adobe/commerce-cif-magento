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

/**
 * argsTransforms defined how to transform each argument
 * checkFields sets arguments that should be checked in any case for a certain field
 */

const { EnumType } = require('json-to-graphql-query');
const MissingPropertyError = require('@adobe/commerce-cif-common/exception').MissingPropertyError;

 /**
  * @private
  * 
  * Returns the equivalent 'Magento field name' for the given 'field' argument.
  * This is used to convert filter ans sort arguments from CIF to Magento.
  * 
  * @param {*} field A 'filter' or 'sort' CIF argument, like 'name.en', 'variants.sku', or 'createdAt'.
  */
function _translateFieldName(field) {
    if (field.startsWith('name')) {
        return 'name';
    }
    if (field.startsWith('price')) {
        return 'price';
    }
    if (field.startsWith('categories.id')) {
        return 'category_id';
    }
    if (field.includes('sku')) {
        return 'sku';
    }
    if (field.startsWith('createdAt')) {
        return 'created_at';
    }
    if (field.startsWith('lastModifiedAt')) {
        return "updated_at";
    }
    return null;
}

let transformerFunctions = {

    /**
     * Converts the CIF 'name' search argument into Magento's 'text' argument.
     * This is used to transform 'searchProducts(text: "jacket")' into 'products(search: "jacket")'.
     */
    text: function(args) {
        args.search = args.text;
        delete args.text;
    },

    /**
     * Converts the CIF 'limit' search argument into Magento's 'pageSize' argument.
     * For example, this is used to transform 'searchProducts(limit: 10)' into 'products(pageSize: 10)'.
     */
    limit: function (args) {
        let defaultLimit = 25;
        let limit = Number(args.limit);
        if (!limit || limit < 0) {
            limit = defaultLimit;
        }
        delete args.limit;
        args.pageSize = limit;
    },

    /**
     * Converts the CIF 'offset' search argument into Magento's 'currentPage' argument.
     * For example, this is used to transform 'searchProducts(offset: 10, limit: 5)' into 'products(currentPage: 3, pageSize: 5)'.
     */
    offset: function (args) {
        let currentPage = 1;
        let limit = args.limit || args.pageSize;
        let offset = Number(args.offset);
        if (!offset || offset < 0) {
            offset = 0;
        }
        if (limit > 0 && offset % limit === 0) {
            currentPage = (offset / limit) + 1;
        }
        args.currentPage = currentPage;
        delete args.offset;
    },

    /**
     * Ensures that the 'searchProducts' function contains the 'text' or 'filter' argument.
     */
    textOrFilter: function (args) {
        let text = args.search;
        let filter = args.filter;
        if (!(text || filter) || (filter && filter.length === 0)) {
            throw new MissingPropertyError(`At least one parameter from [text, filter] must be specified.`);
        }
    },

    /**
     * Converts search filters into the equivalent Magento 'ProductFilterInput' arguments.
     * For example, this is used to tranform 'searchProducts(filter: "variants.sku:meskwielt")' into 'products(filter: {sku: {eq: "meskwielt"}})'.
     */
    filter: function (args) {
        let filterArgs = Array.isArray(args.filter) ? args.filter : [args.filter];
        let filterFields = {};
        filterArgs.forEach((filterArg) => {
            // Translate field names
            let field = _translateFieldName(filterArg);

            // Parse value
            let value;
            let values;
            let split = filterArg.split(':');
            if (split.length == 2) {
                let val = split[1];
                let parts = val.split(',');
                if (parts.length > 1) {
                    values = parts;
                } else {
                    value = parts[0];
                }
            }

            if (field) {
                let filter = {};
                if (value) {
                    filter[field] = { eq: value };
                } else if (values) {
                    filter[field] = { in: values };
                }
                Object.assign(filterFields, filter);
            }
        });
        if (Object.keys(filterFields).length > 0) {
            args.filter = filterFields;
        } else {
            delete args.filter;
        }
    },

    /**
     * Converts 'sort' arguments into the equivalent Magento 'ProductSortInput' and 'SortEnum' arguments.
     * For example, this is used to tranform 'searchProducts(sort: "name.en.asc")' into 'products(sort: {name: ASC})'.
     */
    sort: function (args) {
        let sortArgs = Array.isArray(args.sort) ? args.sort : [args.sort];
        let sortFields = {};

        sortArgs.forEach((sortArg) => {
            // Get direction
            let direction = 'ASC';
            if (sortArg.split('.').slice(-1)[0] == 'desc') {
                direction = 'DESC';
            }

            // Translate field names
            let field = _translateFieldName(sortArg);
            if (field) {
                sortFields[field] = new EnumType(direction);
            }
        });
        if (Object.keys(sortFields).length > 0) {
            args.sort = sortFields;
        } else {
            delete args.sort;
        }
    }
};

/**
 * This defines the fields that have to be processed and/or checked, whenever they are in the original request or not.
 */
let checkFields = {
    searchProducts: ['limit', 'offset'],
    products: ['textOrFilter'] // 'searchProducts' is aliased to 'products', the mandatory check will be done on the aliased object
};

module.exports = { transformerFunctions, checkFields };