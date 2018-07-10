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

const requestConfig = function (uri, method) {
    return {
        uri: uri,
        method: method,
        body: undefined,
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json; charset=utf-8',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'authorization': 'Bearer my-token'
        },
        json: true
    }
};

module.exports.requestConfig = requestConfig;

module.exports.config = {
    MAGENTO_HOST: 'does.not.exist',
    MAGENTO_MEDIA_PATH: 'media/catalog/product',
    PRODUCT_ATTRIBUTES: ['color', 'size'],
    GRAPHQL_PRODUCT_ATTRIBUTES: ['color', 'size'],
    MAGENTO_AUTH_ADMIN_TOKEN: 'my-token',
    SHIPPING_CODES: ['flatrate', 'flatrate']
};

module.exports.categoriesConfig = {
    MEN: {
        name: 'Men'
    },
    WOMEN: {
        name: 'Women',
        SHORTS: {
            name: 'Shorts'
        }
    }
};