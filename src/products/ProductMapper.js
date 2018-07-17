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
const Price = require('@adobe/commerce-cif-model').Price;
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
        
        let pr = new PagedResponse();
        pr.results = this.mapProducts(items);
        pr.offset = (products.page_info.current_page - 1) * products.page_info.page_size;
        pr.count = items.length;
        pr.total = products.total_count;
        
        return pr;
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
        p.sku = product.sku;

        if (product.name) {
            p.name = product.name;
        }
        
        if (product.description) {
            p.description = product.description;
        }
        
        if (product.price && product.price.regularPrice) {
            p.prices = [
                this._mapPrice(product.price.regularPrice)
            ];
        }
        
        if (product.created_at) {
            p.createdDate = formatDate(product.created_at);
        }
        
        if (product.updated_at) {
            p.lastModifiedDate = formatDate(product.updated_at);
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
        let p = new Product(product.sku);
        this._mapProductData(p, product);

        if (product.variants) {
            p.variants = product.variants.map(v => this._mapProductVariant(product, v.product));
            p.masterVariantId = p.variants[0].sku;
        } else {
            p.variants = [{
                id: product.sku,
                sku: product.sku
            }];
            p.masterVariantId = product.sku;
        }
        
        if (this.attributes) {
            this._addAttributes(p, product);
        }

        return p;
    }

    /**
     * Maps a Magento product into a CCIF product
     * 
     * @private
     */
    _mapProductVariant(product, variant) {
        let v = new ProductVariant(variant.sku); // not a mistake, we use the SKU for the ID
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
                    let attr = new Attribute(opt.attribute_code, opt.label, value.label);
                    attr.variantAttribute = true;
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
                let attr = new Attribute(id, id, product[id]);
                attr.variantAttribute = false;
                p.attributes.push(attr);
            }
        });
    }

    /**
     * @private
     */
    _mapPrice(price) {
        return new Price(price.amount.value * 100, price.amount.currency);
    }

    /**
     * @private
     */
    _mapAsset(imageUrl) {
        let asset = new Asset();
        asset.url = (this.imageUrlPrefix || '') + imageUrl; 
        return asset;
    }
    
    /**
     * @private
     */
    _mapCategories(categories) {
        return categories.map(category => {
            return new Category(category.id);
        });
    }
}

module.exports = ProductMapper;
