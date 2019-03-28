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

const main = require('./getHealth.js').main;

const config = {
    "MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME": "3600",
    "MAGENTO_INTEGRATION_TOKEN": "nwh4vc5njvp2joj5ogjt5qus60i7gyhr",
    "MAGENTO_SCHEMA": "https",
    "MAGENTO_HOST": "master-7rqtwti-7ztex4hq2b6mu.us-3.magentosite.cloud",
    "MAGENTO_API_VERSION": "V1",
    "MAGENTO_MEDIA_PATH": "media/catalog/product",
    "PRODUCT_VARIANT_ATTRIBUTES": ["color", "size"],
    "GRAPHQL_PRODUCT_ATTRIBUTES": ["color", "size", "features", "summary"],
    "MAGENTO_IGNORE_CATEGORIES_WITH_LEVEL_LOWER_THAN": 2,

    "CUSTOMER_NAMESPACE": "ruza1",
    "CUSTOMER_PACKAGE": "magento",
    "BINDINGS_NAMESPACE": "ruza2"
}; // Werte aus deiner Config, z.B. admin token

main(config).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
