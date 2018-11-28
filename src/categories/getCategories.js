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

const CategoryMapper = require('./CategoryMapper');
const MagentoCategories = require('./MagentoCategories');
const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const ERROR_TYPE = require('./constants').ERROR_TYPE;


/**
 * This action returns the entire category structure, a given category, or a subset of the categories depending on pagination.
 * While the parameters 'limit', 'offset', and 'depth' are integers, they should be passed as strings because they are
 * typically parsed from HTTP query parameters.
 *
 * @param   {string} args.MAGENTO_SCHEMA            Schema to use when calling magento. http/https
 * @param   {string} args.MAGENTO_API_VERSION       The version of REST API
 * @param   {string} args.MAGENTO_HOST              Hostname of the magento instance
 * @param   {string} args.MAGENTO_AUTH_ADMIN_TOKEN  Authentication token to use when calling magento REST API.
 *
 * @param   {string} args.id                        an optional category id
 * @param   {string} args.type                      defines if the request should return either a flat or tree category structure
 * @param   {string} args.limit                     the maximum number of results that should be returned
 * @param   {string} args.offset                    the number of categories to skip when returning the result
 * @param   {string} args.sort                      a string of sort directives separated by the ',' (comma) character
 * @param   {string} args.depth                     defines the maximum depth of the returned categories
 * @return  {Promise.<PagedResponse>}               a paged response object or Category if a category id was set in the request
 */
function getCategories(args) {
    const validator = new InputValidator(args, ERROR_TYPE);

    validator
        .checkArguments()
        .isInsideInterval('limit', 1)
        .isInsideInterval('offset', 0);
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const id = args.id;
    const slug = args.slug;
    const limit = (args.limit && !Number.isNaN(args.limit)) ? Number(args.limit) : 50;
    const offset = (args.offset && !Number.isNaN(args.offset)) ? Number(args.offset) : 0;
    const depth = (args.depth && !Number.isNaN(args.depth)) ? Number(args.depth) : - 1;
    const type = args.type || 'flat';
    const sorts = args.sort ? args.sort.split('|') : [];

    let mapper;
    if (id) {
        mapper = CategoryMapper.mapCategory;
    } else if (slug) {
        mapper = CategoryMapper.mapCategoryListToCategory;
    } else {
        mapper = CategoryMapper.mapPagedCategoryResponse;
    }
    const categories = new MagentoCategories(args, mapper, `categories`);

    if (id) {
        categories.byId(id);
    } else if (slug) {
        categories.bySlug(slug);
    } else {
        categories.list();
        categories.perPage(limit);
        categories.page(offset / limit);
    }

    // sort orders
    sorts.forEach(sort => {
        let sortParameter = splitSortParameter(sort);
        categories.sort(sortParameter.field, sortParameter.direction);
    });

    return categories.getCategories(type, depth);
}

function splitSortParameter(sortString) {
    let field;
    let direction;

    if (sortString.endsWith('.desc')) {
        direction = 'desc';
    } else {
        direction = 'asc';
    }

    // Strip everything after the first dot since the sorting fields in Magento are top level and nesting does not work.
    // This means that if the sorting field from the client is for example 'name.asc' it will become 'name'.
    let index = sortString.indexOf('.');
    field = index === -1 ? sortString : sortString.substring(0, index);

    return {
        'field': field,
        'direction': direction
    };
}

module.exports.main = getCategories;
