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

const InputValidator = require('@adobe/commerce-cif-common/input-validator');
const req = require('request-promise-native');
const ProductGraphQlRequestBuilder = require('./ProductGraphQlRequestBuilder');
const ProductMapper = require('./ProductMapper');
const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * This action searches Magento product data based on search and filter criteria.
 *
 * @param   {string} args.MAGENTO_SCHEMA                Magento host URL schema (http or https)
 * @param   {string} args.MAGENTO_HOST                  Magento host URL
 * @param   {string} args.GRAPHQL_PRODUCT_ATTRIBUTES    The product attributes fetched by the graphQL request
 * 
 * @param   {string} args.text                 a string which should be used to perform a full-text search
 * @param   {string} args.filter               a string of search filters separated by the '|' (pipe) character
 * @param   {string} args.limit                the maximum number of results that should be returned
 * @param   {string} args.offset               the number of products to skip when returning the result
 * @param   {string} args.sort                 a string of sort directives separated by the '|' (pipe) character
 *
 * @return  {Promise.<PagedResponse>}          a paged response object
 */
function searchProducts(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    
    validator
        .checkArguments()
        .atLeastOneParameter(['filter', 'text'])
        .isInteger('limit')
        .isInsideInterval('limit', 1)
        .isInteger('offset')
        .isInsideInterval('offset', 0);
    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const client = new MagentoClientBase(args, null, '', ERROR_TYPE);

    // Build GraphQL request
    let builder = new ProductGraphQlRequestBuilder(`${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/graphql`, __dirname + '/searchProducts.graphql', args);
    let options;
    try {
        options = builder.build();
    } catch (e) {
        return client.handleError(e);
    }

    let request;
    if (args.DEBUG) {
        request = client._profileRequest(options);
    } else {
        request = req(options);
    }
    return request.then((response) => {
        let imageUrlPrefix = `${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/${args.MAGENTO_MEDIA_PATH}`;
        let productMapper = new ProductMapper(imageUrlPrefix, args.GRAPHQL_PRODUCT_ATTRIBUTES);
        return client._handleSuccess(productMapper.mapGraphQlResponse(response.body), {}, response.statusCode);
    }).catch((err) => {
        return client.handleError(err);
    });
}

module.exports.main = searchProducts;