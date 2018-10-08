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

const formatDate = require('@adobe/commerce-cif-magento-common/utils').formatDate;

/**
 * We export a closure function that is initialised with the Openwhisk action parameters required to get
 * the image URL prefix and the non-variant product attributes.
 * 
 * That closure expects that the config argument object has the properties 'imageUrlPrefix'
 * and 'baseProductAttributes'.
 * 
 * @param {*} config 
 */
const configureMapper = (config) => {

    /**
     * To map Magento product data into CIF product data, we cannot rely on the existing ProductMapper used for the REST API.
     * This is because GraphQL requests explicitly define what data fields should be returned, so the data must be mapped
     * from Magento to CIF according to the original CIF GraphQL request.
     * 
     * Hence each function uses a switch-case block to only map the data requested for each "block" of the original data.
     * For example, for each field of the following request:
     * 
     * searchProducts(text: "meskwielt") {
     *     offset
     *     results {
     *         id
     *     }
     * }
     * 
     * The mapping is done by:
     * - offset: mapped by 'mapPagedResponse' because it's the root field-mapper, then "case offset:"
     * - results: mapped by 'mapPagedResponse' because it's the root field-mapper, then "case results:", then 'arrayMapper/mapProduct'
     * - results.id: mapped by 'mapProduct', then "case id:"
     */

    
    /**
     * Generic function used to easily map arrays.
     */
    const arrayMapper = (req, data, mapperfunction) => {
        if (data && data.length > 0) {
            return data.map(d => {
                return mapperfunction(req, d);
            });
        } else {
            return [];
        }
    }

    /**
     * Maps Magento prices into CIF prices, only including fields requested in the original GraphQL request.
     */
    const mapPrices = (req, data) => {
        let result = {};
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "amount":
                    result[key] = data[key] ? data[key] * 100 : null;
                    break;
                default:
                    if (!field.startsWith("__")) {
                        result[key] = data[key] || data[key] === 0 ? data[key] : null;
                    }
                    break;
            }
        });
        return result;
    }

    /**
     * Maps Magento images into CIF assets, only including fields requested in the original GraphQL request.
     */
    const mapAssets = (req, imageUrl) => {
        let result = {};
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            if (field === "id") {
                result[key] = imageUrl;
            } else if (field === 'url') {
                result[key] = config.imageUrlPrefix + imageUrl;
            }
        });
        return result;
    }

    /**
     * Maps Magento variant attributes into CIF attributes, mapping all possible fields.
     */
    const _mapVariantAttributes = (data, configurableOpts) => {
        let attributes = [];
        if (configurableOpts) {
            configurableOpts.map(opt => {
                if (data[opt.attribute_code] !== null) { //if there is an attribute value for this product
                    let value = opt.values.find(v => v.value_index === data[opt.attribute_code]);
                    if (value !== null) {
                        let att = {
                            id: opt.attribute_code,
                            name: opt.label,
                            value: value.label,
                            isVariantAxis: true
                        };
                        attributes.push(att);
                    }
                }
            });
        }
        return attributes;
    }

    /**
     * Maps Magento simple attributes into CIF attributes, mapping all possible fields.
     */
    const _mapSimpleAttributes = (data, baseProductAttributes) => {
        let attributes = [];
        if (baseProductAttributes) {
            baseProductAttributes.map(a => {
                if (data[a]) {
                    let att = {
                        id: a,
                        name: a.charAt(0).toUpperCase() + a.substr(1),
                        value: data[a],
                        isVariantAxis: false
                    }
                    attributes.push(att);
                }
            });
        }
        return attributes;
    }

    /**
     * Maps Magento attributes into CIF attributes, only including fields requested in the original GraphQL request.
     */
    const mapAttributes = (req, data, configurableOpts) => {
        // Collect all attributes, include variant and simple attributes
        let attributes = [];
        attributes = attributes.concat(_mapVariantAttributes(data, configurableOpts));
        attributes = attributes.concat(_mapSimpleAttributes(data, config.baseProductAttributes));

        // For each attribute, we only include the fields requested in the original GraphQL request.
        let results = [];
        if (attributes.length > 0) {
            let id = undefined;
            let name = undefined;
            let value = undefined;
            let isVariantAxis = undefined;
            let n = 0;
            Object.keys(req).forEach(key => {
                let field = req[key].__aliasFor || key;
                switch (field) {
                    case "id":
                        id = { key: key, value: attributes.map(a => { return a.id }) };
                        n = Math.max(n, id.value.length);
                        break;
                    case "name":
                        name = { key: key, value: attributes.map(a => { return a.name }) };
                        n = Math.max(n, name.value.length);
                        break;
                    case "value":
                        value = { key: key, value: attributes.map(a => { return a.value }) };
                        n = Math.max(n, value.value.length);
                        break;
                    case "isVariantAxis":
                        isVariantAxis = { key: key, value: attributes.map(a => { return a.isVariantAxis }) };
                        n = Math.max(n, isVariantAxis.value.length);
                        break;
                    default:
                        break;
                }
            });
            for (let i = 0; i < n; ++i) {
                let result = results[i] = {};
                [id, name, value, isVariantAxis].forEach(att => {
                    if (att) {
                        result[att.key] = att.value[i];
                    }
                });
            }
        }
        return results;
    }

    /**
     * Maps Magento product data into CIF product data (Product or ProductVariant), only including fields requested in the original GraphQL request.
     */
    const mapAbstractProduct = (req, data) => {
        let result = {};
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "id":
                    result[key] = data[key];
                    break;
                case "createdAt":
                case "lastModifiedAt":
                    result[key] = data[key] ? formatDate(data[key]) : null;
                    break;
                case "prices": {
                    let hasPrice = data.price && data.price.regularPrice && data.price.regularPrice.amount;
                    result[key] = hasPrice ? [mapPrices(req[key], data.price.regularPrice.amount)] : [];
                    break;
                }
                case "assets":
                    result[key] = data.image ? [mapAssets(req[key], data.image)] : [];
                    break;
                case "categories":
                    result[key] = arrayMapper(req[key], data[key], mapCategory);
                    break;
                default:
                    if (!field.startsWith("__")) {
                        result[key] = data[key] || data[key] > 0 ? data[key] : null;
                    }
                    break;
            }
        });
        return result;
    }

    /**
     * Maps Magento "variant" data into CIF ProductVariant, only including fields requested in the original GraphQL request.
     */
    const mapProductVariant = (req, data, configurableOpts) => {
        let result = mapAbstractProduct(req, data);
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "attributes":
                    result[key] = mapAttributes(req[key], data, configurableOpts);
                    break;
                case "available":
                    result[key] = true; // TODO: Get actual value from backend
                    break;
                default:
                    break;
            }
        });
        return result;
    }

    /**
     * Maps Magento "base product" data into CIF Product, only including fields requested in the original GraphQL request.
     */
    const mapProduct = (req, data) => {
        let result = mapAbstractProduct(req, data);
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "masterVariantId":
                    result[key] = getMasterVariantId(data, data.variants);
                    break;
                case "attributes":
                    result[key] = mapAttributes(req[key], data, null); //only nonConfigAttributes
                    break;
                case "variants":
                    if (data[key] && data[key].length > 0) {
                        result[key] = data[key].map(d => {
                            return mapProductVariant(req[key], d.product, data.configurable_options);
                        });
                    } else {
                        result[key] = [];
                    }
                    break;
                default:
                    break;
            }
        });
        return result;
    }

    /**
     * Maps Magento category data into CIF Category, only including fields requested in the original GraphQL request.
     */
    const mapCategory = (req, data) => {
        let result = {};
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "createdAt":
                case "lastModifiedAt":
                    result[key] = formatDate(data[key]);
                    break;
                case "children":
                case "parents":
                    result[key] = [];
                    break;
                default:
                    if (!field.startsWith("__")) {
                        result[key] = data[key] || null;
                    }
                    break;
            }
        });
        return result;
    }

    const getMasterVariantId = (data, variants) => {
        if (variants && variants.length > 0) {
            return variants[0].product.sku;
        } else {
            return data.sku;
        }
    }

    /**
     * Maps Magento search results data into CIF PagedResponse, only including fields requested in the original GraphQL request.
     */
    const mapPagedResponse = (originalObject, dataObject, fieldName) => {
        let req = originalObject[fieldName];
        let data = dataObject[fieldName];
        let result = {};
        let total = data.total;
        let current_page = data.page_info ? data.page_info.current_page : null; //has data if needed
        let page_size = data.page_info ? data.page_info.page_size : null;
        Object.keys(req).forEach(key => {
            let field = req[key].__aliasFor || key;
            switch (field) {
                case "results":
                    result[key] = arrayMapper(req[key], data[key], mapProduct);
                    break;
                case "offset":
                    result[key] = (current_page - 1) * page_size;
                    break;
                case "count":
                    result[key] = current_page * page_size > total ? (total % page_size) : page_size;
                    break;
                case "facets":
                    result[key] = [];
                    break;
                default:
                    if (!field.startsWith("__")) {
                        result[key] = data[key] || data[key] === 0 ? data[key] : null;
                    }
                    break;
            }
        });
        return result;
    }

    // Defines the 'searchproducts' root field and the root mapper
    return {
        searchProducts: mapPagedResponse
    }
}

module.exports = configureMapper;