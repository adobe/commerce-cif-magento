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

const Product = require('@adobe/commerce-cif-model').Product;
const MoneyValue = require('@adobe/commerce-cif-model').MoneyValue;
const Asset = require('@adobe/commerce-cif-model').Asset;
const Attribute = require('@adobe/commerce-cif-model').Attribute;
const ProductVariant = require('@adobe/commerce-cif-model').ProductVariant;
const Category = require('@adobe/commerce-cif-model').Category;
const PagedResponse = require('@adobe/commerce-cif-model').PagedResponse;
const formatDate = require('@adobe/commerce-cif-magento-common/utils').formatDate;

/**
 * Utility class to map Magento products to CCIF products.
 */
class ProductMapper {

    constructor(imageUrlPrefix, attributes) {
        this.imageUrlPrefix = imageUrlPrefix;
        this.attributes = attributes;
    }

    /**
     * Maps a Magento products graphQL search to a PagedResponse
     *
     * @param result                JSON object returned by the Magento graphQL products request.
     * @returns {PagedResponse}     A paged response with products.
     */
    mapGraphQlResponse(result) {
        let products = result.data.products;
        let items = result.data.products.items;

        let results = this.mapProducts(items);
        let offset = (products.page_info.current_page - 1) * products.page_info.page_size;

        return new PagedResponse.Builder()
            .withCount(items.length)
            .withOffset(offset)
            .withTotal(products.total_count)
            .withResults(results)
            .build();
    }

    mapGraphQlResponseOfSingleProduct(result) {
        const items = result.data.products.items;
        return this._mapProduct(items[0]);
    }

    /**
     * Maps an array of Magento products to an array of CCIF products
     *
     * @param products              JSON array of Magento products.
     * @returns [Product]           An array of CCIF products.
     */
    mapProducts(products) {
        return products.map(product => this._mapProduct(product));
    }
    
    /**
     * Maps some generic Magento product data to either a CCIF Product or ProductVariant.
     * 
     * @param p                     Either a Product or ProductVariant CCIF object.
     * @param product               A Magento product.
     * @private
     */
    _mapProductData(p, product) {

        if (product.description) {
            p.description = product.description;
        }

        if (product.created_at) {
            p.createdAt = formatDate(product.created_at);
        }
        
        if (product.updated_at) {
            p.lastModifiedAt = formatDate(product.updated_at);
        }
        
        if (product.image) {
            p.assets = [
                this._mapAsset(product.image)
            ];
        }
        
        if (product.categories) {
            p.categories = this._mapCategories(product.categories);
        }

    }

    /**
     * Maps a Magento product into a CCIF product
     *
     * @private
     */
    _mapProduct(product) {

        //required fields
        let prices = [];
        let variants;
        let masterVariantId;

        if (product.price && product.price.regularPrice) {
            prices = [
                this._mapPrice(product.price.regularPrice)
            ];
        }

        if (product.variants) {
            variants = product.variants.map(v => this._mapProductVariant(product, v.product));
            masterVariantId = variants[0].sku;
        } else {
            variants = [
                new ProductVariant.Builder()
                    .withAvailable(product.stock_status === "IN_STOCK")
                    .withId(product.sku)
                    .withName(product.name || '')
                    .withPrices(prices)
                    .withSku(product.sku)
                    .build()
            ];
            masterVariantId = product.sku;
        }

        let p = new Product.Builder()
            .withId(product.sku)
            .withName(product.name || '')
            .withVariants(variants)
            .withMasterVariantId(masterVariantId)
            .withPrices(prices)
            .build();

        this._mapProductData(p, product);

        if (this.attributes) {
            this._addAttributes(p, product);
        }

        p.sku = product.sku;

        return p;
    }

    /**
     * Maps a Magento product into a CCIF product
     * 
     * @private
     */
    _mapProductVariant(product, variant) {
        let available = variant.stock_status === "IN_STOCK";
        let prices = [];
        if (variant.price && variant.price.regularPrice) {
            prices = [
                this._mapPrice(variant.price.regularPrice)
            ];
        }
        let v = new ProductVariant.Builder()
            .withAvailable(available)
            .withId(variant.sku) // not a mistake, we use the SKU for the ID
            .withName(variant.name || '')
            .withPrices(prices)
            .withSku(variant.sku)
            .build();

        this._mapProductData(v, variant);
        
        if (product.configurable_options) {
            v.attributes = this._addConfigurableOptions(product, variant);
        }
        
        if (this.attributes) {
            this._addAttributes(v, variant);
        }

        return v;
    }
    
    /**
     * @private
     */
    _addConfigurableOptions(product, variant) {
        return product.configurable_options.map(opt => {
            if (variant[opt.attribute_code] != null) {
                let value = opt.values.find(v => v.value_index == variant[opt.attribute_code]);
                if (value != null) {
                    let attr = new Attribute.Builder()
                        .withId(opt.attribute_code)
                        .withName(opt.label)
                        .withValue(value.label)
                        .build();
                    attr.isVariantAxis = true;
                    return attr;
                }
            }
        });
    }
    
    /**
     * @private
     */
    _addAttributes(p, product) {
        if (p.attributes === undefined) {
            p.attributes = [];
        }

        this.attributes.forEach(id => {
            if (p.attributes.find(attr => attr.id == id)) {
                return;
            }

            if (product[id]) {
                let attr = new Attribute.Builder()
                    .withId(id)
                    .withName(id)
                    .withValue(product[id])
                    .build();
                attr.isVariantAxis = false;
                p.attributes.push(attr);
            }
        });
    }

    /**
     * @private
     */
    _mapPrice(price) {
        return new MoneyValue.Builder()
            .withAmount(price.amount.value * 100)
            .withCurrency(price.amount.currency)
            .build();
    }

    /**
     * @private
     */
    _mapAsset(imageUrl) {
        let asset = new Asset.Builder()
            .withId(imageUrl)
            .withUrl((this.imageUrlPrefix || '') + imageUrl)
            .build();
        return asset;
    }
    
    /**
     * @private
     */
    _mapCategories(categories) {
        return categories.map(category => {
            return new Category.Builder().withId(category.id.toString()).build();
        });
    }
}

module.exports = ProductMapper;
