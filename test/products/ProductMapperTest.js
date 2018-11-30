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

const assert = require('chai').assert;
const searchProductsBySku = require('../resources/searchProductsBySku');
const searchProductsWithPaging = require('../resources/searchProductsWithPaging');
const searchSingleProductData = require('../resources/sample-product-search-single-product');
const utils = require('../lib/utils');

describe('Magento ProductMapper', () => {

    let mapper = utils.getPathForAction(__dirname, 'ProductMapper');
    let ProductMapper = require(mapper);
    let imageUrlPrefix = 'http://server/pub/media/catalog/product';
    let attributes = ["color", "size", "features", "summary"];
    let productMapper = new ProductMapper(imageUrlPrefix, attributes);
    let formatDate = require(mapper.replace('ProductMapper', 'node_modules/@adobe/commerce-cif-magento-common/utils')).formatDate;

    describe('Unit tests', () => {
        let simpleData = undefined;
        let pagedData = undefined;
        let singleProductData = undefined;

        beforeEach(() => {
            // clone original sample data before each test
            simpleData = JSON.parse(JSON.stringify(searchProductsBySku));
            pagedData = JSON.parse(JSON.stringify(searchProductsWithPaging));
            singleProductData = JSON.parse(JSON.stringify(searchSingleProductData.simpleProductResponse.body));
        });

        it('Maps Magento graphQL response into valid CIF Cloud product', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            assert.isArray(pagedResponse.results);
            assert.lengthOf(pagedResponse.results, 1);
            assert.strictEqual(pagedResponse.offset, 0);
            assert.strictEqual(pagedResponse.total, 1);
            assert.strictEqual(pagedResponse.count, 1);

            let product = pagedResponse.results[0];
            let magentoProduct = simpleData.data.products.items[0];
            let magentoFirstVariant = magentoProduct.variants[0].product;

            assert.strictEqual(product.id, magentoProduct.sku);
            assert.strictEqual(product.sku, magentoProduct.sku);
            assert.strictEqual(product.masterVariantId, magentoFirstVariant.sku);
            assert.strictEqual(product.name, magentoProduct.name);
            assert.strictEqual(product.createdAt, formatDate(magentoProduct.created_at));
            assert.strictEqual(product.lastModifiedAt, formatDate(magentoProduct.updated_at));
            assert.lengthOf(product.variants, magentoProduct.variants.length);
            assert.lengthOf(product.categories, magentoProduct.categories.length);
            product.categories.forEach(category => {
                assert.isDefined(category.id);
                assert.isString(category.id);
            });

            assert.strictEqual(product.attributes.length, 2);
            product.attributes.forEach(attr => {
                assert.isFalse(attr.isVariantAxis);
                assert.strictEqual(attr.value, magentoProduct[attr.id]);
            });
        });

        it('Maps Magento graphQL response into valid CIF Cloud product variants', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            let product = pagedResponse.results[0];
            let magentoProduct = simpleData.data.products.items[0];

            product.variants.forEach(variant => {
                let magentoVariant = magentoProduct.variants.find(v => v.product.sku == variant.sku).product;
                assert.strictEqual(variant.id, magentoVariant.sku);
                assert.strictEqual(variant.sku, magentoVariant.sku);
                assert.strictEqual(variant.name, magentoVariant.name);
                assert.strictEqual(variant.createdAt, formatDate(magentoVariant.created_at));
                assert.strictEqual(variant.lastModifiedAt, formatDate(magentoVariant.updated_at));
                assert.lengthOf(product.categories, magentoProduct.categories.length);

                assert.isArray(variant.prices);
                assert.lengthOf(variant.prices, 1);
                variant.prices.forEach(price => {
                    assert.containsAllKeys(price, ['amount', 'currency']);
                    assert.isNumber(price.amount);
                    assert.strictEqual(price.amount, magentoVariant.price.regularPrice.amount.value * 100);
                    assert.strictEqual(price.currency, magentoVariant.price.regularPrice.amount.currency);
                });

                assert.strictEqual(variant.attributes.length, 4);
                variant.attributes.forEach(attr => {
                    if (attr.isVariantAxis) {
                        let option = magentoProduct.configurable_options.find(opt => opt.attribute_code == attr.id);
                        assert.strictEqual(attr.name, option.label);
                        let index = magentoVariant[attr.id];
                        assert.strictEqual(attr.value, option.values.find(v => v.value_index == index).label);
                    } else {
                        assert.strictEqual(attr.value, magentoProduct[attr.id]);
                    }
                });
            });
        });

        it('Maps a simple product without variants into a CIF product with a single variant', () => {
            // Delete all variants = make the product a simple-product
            delete simpleData.data.products.items[0].variants;
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);

            let product = pagedResponse.results[0];
            let variant = product.variants[0];
            assert.lengthOf(product.variants, 1);
            assert.strictEqual(variant.id, product.id);
            assert.strictEqual(variant.sku, product.sku);
            assert.strictEqual(variant.name, product.name);
            assert.isArray(variant.prices);
            for (let i = 0, l = variant.prices.length; i < l; i++) {
                let variantPrice = variant.prices[0];
                let productPrice = product.prices[0];
                assert.containsAllKeys(variantPrice, ['amount', 'currency']);
                assert.isNumber(variantPrice.amount);
                assert.strictEqual(variantPrice.amount, productPrice.amount);
                assert.strictEqual(variantPrice.currency, productPrice.currency);
            }
        });

        it('Maps Magento graphQL response into valid CIF Cloud prices', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            let product = pagedResponse.results[0];
            assert.isArray(product.prices);
            assert.lengthOf(product.prices, 1);

            product.prices.forEach(price => {
                assert.hasAnyKeys(price, ['amount', 'currency', 'country']);
                assert.isNumber(price.amount);
            });

            assert.isUndefined(product.prices[0].country);
        });

        it('Maps Magento graphQL response into valid CIF Cloud assets', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            let product = pagedResponse.results[0];
            assert.isArray(product.assets);
            assert.lengthOf(product.assets, 1);

            product.assets.forEach(asset => {
                assert.hasAnyKeys(asset, ['id', 'url']);
                assert.isTrue(asset.url.startsWith(imageUrlPrefix));
            });
        });

        it('Maps Magento graphQL paged response into valid CIF Cloud response', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(pagedData);
            let expectedItems = pagedData.data.products.items.length;
            assert.isArray(pagedResponse.results);
            assert.lengthOf(pagedResponse.results, expectedItems);
            assert.strictEqual(pagedResponse.offset, expectedItems);
            assert.strictEqual(pagedResponse.total, 5);
            assert.strictEqual(pagedResponse.count, expectedItems);

            for (let i = 0; i < expectedItems; i++) {
                let product = pagedResponse.results[i];
                let magentoProduct = pagedData.data.products.items[i];
                let magentoFirstVariant = magentoProduct.variants[0].product;

                assert.strictEqual(product.id, magentoProduct.sku);
                assert.strictEqual(product.masterVariantId, magentoFirstVariant.sku);
                assert.strictEqual(product.name, magentoProduct.name);
                assert.strictEqual(product.description, magentoFirstVariant.description);
                assert.strictEqual(product.createdAt, formatDate(magentoProduct.created_at));
                assert.strictEqual(product.lastModifiedAt, formatDate(magentoProduct.updated_at));
                assert.lengthOf(product.variants, magentoProduct.variants.length);
                assert.lengthOf(product.categories, magentoProduct.categories.length);
            }
        });

        it('Maps Magento graphQL response into valid single product CIF Cloud response', () => {
            let response = productMapper.mapGraphQlResponseOfSingleProduct(singleProductData);
            assert.strictEqual(response.id, 'testSimpleProduct');
            assert.strictEqual(response.sku, 'testSimpleProduct');
        });

        it('maps a category url_path to a slug', () => {
            const pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            const category = pagedResponse.results[0].categories[0];
            assert.strictEqual(category.slug, "men/jacket");

            const variantCategory = pagedResponse.results[0].variants[0].categories[0];
            assert.strictEqual(variantCategory.slug, "men/jacket");
        });

        it('maps a category without a url_path', () => {
            delete(simpleData.data.products.items[0].categories[0].url_path);
            delete(simpleData.data.products.items[0].variants[0].product.categories[0].url_path);

            const pagedResponse = productMapper.mapGraphQlResponse(simpleData);
            const category = pagedResponse.results[0].categories[0];
            assert.isUndefined(category.slug);

            const variantCategory = pagedResponse.results[0].variants[0].categories[0];
            assert.isUndefined(variantCategory.slug);
        });

        it('maps a product url_key to a slug', () => {
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);

            let product = pagedResponse.results[0];
            assert.strictEqual(product.slug, "el-gordo-down-jacket");

            let firstVariant = product.variants[0];
            // Make sure the slug of the base product is returned. The sample data has a different slug for the variant to cross check.
            assert.strictEqual(firstVariant.slug, "el-gordo-down-jacket");
        });

        it('maps a product without a slug', () => {
            simpleData.data.products.items[0].url_key = null;
            simpleData.data.products.items[0].variants[0].product.url_key = null;
            let pagedResponse = productMapper.mapGraphQlResponse(simpleData);

            let product = pagedResponse.results[0];
            assert.isUndefined(product.slug);

            let firstVariant = product.variants[0];
            assert.isUndefined(firstVariant.slug);
        });

    });
});
