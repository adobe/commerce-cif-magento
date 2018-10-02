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
const imagePrefix = "http://master-7rqtwti-7ztex4hq2b6mu.us-3.magentosite.cloud/media/catalog/product"
const nonConfigAttributes = ['features', 'summary'];

const arrayMapper = (req, data, type) => {
    if (data && data.length > 0) {
        return data.map(d => {
            return type(req, d);
        });
    } else {
        return [];
    }
}

const Price = (req, data) => {
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

const Asset = (req, imageUrl) => {
    let result = {};
    Object.keys(req).forEach(key => {
        let field = req[key].__aliasFor || key;
        if (field === "id") {
            result[key] = imageUrl;
        } else if (field === 'url') {
            result[key] = imagePrefix + imageUrl;
        }
    });
    return result;
}

const Attributes = (req, data, configurableOpts) => {
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
    nonConfigAttributes.map(a => {
        if (data[a] !== null) {
            let att = {
                id: a,
                name: a.charAt(0).toUpperCase() + a.substr(1),
                value: data[a],
                isVariantAxis: false
            }
            attributes.push(att);
        }
    });

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
        if (n > 0) {
            for (let i = 0; i < n; ++i) {
                let result = results[i] = {};
                [id, name, value, isVariantAxis].forEach(att => {
                    if (att) {
                        result[att.key] = att.value[i];
                    }
                });
            }
        }
    }
    return results;
}

const _Product = (req, data) => {
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
                result[key] = hasPrice ? [Price(req[key], data.price.regularPrice.amount)] : [];
                break;
            }
            case "assets":
                result[key] = data.image ? [Asset(req[key], data.image)] : [];
                break;
            case "categories":
                result[key] = arrayMapper(req[key], data[key], Category);
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

const ProductVariant = (req, data, configurableOpts) => {
    let result = _Product(req, data);
    Object.keys(req).forEach(key => {
        let field = req[key].__aliasFor || key;
        switch (field) {
            case "attributes":
                result[key] = Attributes(req[key], data, configurableOpts);
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

const Product = (req, data) => {
    let result = _Product(req, data);
    Object.keys(req).forEach(key => {
        let field = req[key].__aliasFor || key;
        switch (field) {
            case "masterVariantId":
                result[key] = getMasterVariant(data, data.variants);
                break;
            case "attributes":
                result[key] = Attributes(req[key], data, null); //only nonConfigAttributes
                break;
            case "variants":
                if (data[key] && data[key].length > 0) {
                    result[key] = data[key].map(d => {
                        return ProductVariant(req[key], d.product, data.configurable_options);
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

const Category = (req, data) => {
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

const getMasterVariant = (data, variants) => {
    if (variants && variants.length > 0) {
        return variants[0].product.sku;
    } else {
        return data.sku;
    }
}

const PagedResponse = (originalObject, dataObject, fieldName) => {
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
                result[key] = arrayMapper(req[key], data[key], Product);
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


//define the rootfields in the actual mapper, delegate handling of rootFields to functions
const magentoMapper = {
    searchProducts: PagedResponse
};

module.exports = magentoMapper;