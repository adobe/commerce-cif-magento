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

const requestConfig = function (uri, method, token = 'my-token') {
    return {
        uri: uri,
        method: method,
        body: undefined,
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json; charset=utf-8',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'authorization': `Bearer ${token}`
        },
        json: true
    }
};

module.exports.requestConfig = requestConfig;

let config = {
    MAGENTO_HOST: 'does.not.exist',
    MAGENTO_MEDIA_PATH: 'media/catalog/product',
    PRODUCT_ATTRIBUTES: ['color', 'size'],
    GRAPHQL_PRODUCT_ATTRIBUTES: ['color', 'size'],
    MAGENTO_AUTH_ADMIN_TOKEN: 'my-token',
    SHIPPING_CODES: ['flatrate', 'flatrate']
};
module.exports.config = config;

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

/**
 * Configures different magento base endpoints for guest and customer cart.
 * This is a temporary solution and saves duplicating Unit Test code that is almost the same. Will be removed with
 * graph QL cart.
 */
module.exports.specsBuilder = function(propName, propValue) {

    let baseGuestCart = 'guest-carts';
    let baseGuestAggregatedCart = 'guest-aggregated-carts';
    let baseCustomerCart = 'carts';
    let baseCustomerAggregatedCart = 'customer-aggregated-carts';
    let cartId = '12345-7';

    let specs = [
        {
            name: 'guest',
            args: {
                id: `${cartId}`
            },
            baseCart: `${baseGuestCart}`,
            baseEndpoint: `${baseGuestCart}/${cartId}`,
            baseEndpointAggregatedCart: `${baseGuestAggregatedCart}/${cartId}`,
            token: config.MAGENTO_AUTH_ADMIN_TOKEN,
        },
        {
            name: 'customer',
            args: {
                id: `${cartId}`,
                __ow_headers: {
                    'cookie': `ccs-magento-customer-token=customer-token;`
                }
            },
            baseCart: `${baseCustomerCart}/mine`,
            baseEndpoint: `${baseCustomerCart}/mine`,
            baseEndpointAggregatedCart: `${baseCustomerAggregatedCart}/mine`,
            token: 'customer-token'
        }
    ];

    if (propName && propValue) {
        specs.forEach(spec => {
            spec.args[propName] = propValue;
        });
    }
    return specs;
}
