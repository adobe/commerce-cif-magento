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
const ERROR_TYPE = require('./constants').ERROR_TYPE;
const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ProductGraphQlRequestBuilder = require('./ProductGraphQlRequestBuilder');
const httpRequest = require('request-promise-native');
const ProductMapper = require('./ProductMapper');


function getProduct(args) {
    const validator = new InputValidator(args, ERROR_TYPE);
    validator.checkArguments().mandatoryParameter('id');

    if (validator.error) {
        return validator.buildErrorResponse();
    }

    const client = new MagentoClientBase(args, null, '', ERROR_TYPE);
    const builder = new ProductGraphQlRequestBuilder(`${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/graphql`, __dirname + '/searchProducts.graphql', args);

    let requestOptions = null;
    try {
        requestOptions = builder.bySku().build();
    } catch (error) {
        return client.handleError(error);
    }

    return httpRequest(requestOptions).then(response => {
        const items = response.body.data.products.items;
        if (!items || items.length === 0) {
            return Promise.reject({
                statusCode: 404
            });
        }

        const imageUrlPrefix = `${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/${args.MAGENTO_MEDIA_PATH}`;
        const productMapper = new ProductMapper(imageUrlPrefix, args.GRAPHQL_PRODUCT_ATTRIBUTES);

        return client._handleSuccess(productMapper.mapGraphQlResponseOfSingleProduct(response.body), {}, response.statusCode);
    }).catch((error) => {
        return client.handleError(error);
    });


}

module.exports.main = getProduct;