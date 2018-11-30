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

const getProduct = require('./getProduct');

/**
 * This action searches a single Magento product by its SKU.
 *
 * @param   {string} args.MAGENTO_SCHEMA                Magento host URL schema (http or https)
 * @param   {string} args.MAGENTO_HOST                  Magento host URL
 * @param   {string} args.GRAPHQL_PRODUCT_ATTRIBUTES    The product attributes fetched by the graphQL request
 * @param   {string} args.MAGENTO_MEDIA_PATH            Magento media base path
 * 
 * @param   {string} args.id                            The SKU of the product.
 *
 * @return  {Promise.<Product}                          A promise which resolves to a product model representation
 */
module.exports.main = (args) => {
    return getProduct(args, 'id', 'variants.sku');
};