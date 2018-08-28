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

/**
 * Meant for creating an object that can be used in templates afterwards.
 */
class ToMagentoMapper {

    /**
     * @param {String[]}                simpleFields    simple scalar fields (e.g. 'sku', 'lastModifiedAt')
     * @param {Map<String, String>}     renameMap       defines patterns to be renamed
     * @param {String[]}                attributes      array with magento arguments
     * @param {String[]}                assets          array with magento assets
     */
    constructor(simpleFields, renameMap, attributes, assets) {
        this.simpleFields = simpleFields;
        this.renamers = renameMap;
        this.attributes = attributes;
        this.assets = assets;
    }

    /**
     * Renames patterns globally using renamers map
     * 
     * @param   {String} source     CIF graphql source int this case (could be any string though)
     * @returns {String}            source with renamed patterns as defined in renamers
     */
    renameFields(source) {
        // forEach in map takes the value as first parameter!
        this.renamers.forEach((newPattern, oldPattern) => {
            let expression = new RegExp(oldPattern, 'g');
            source = source.replace(expression, newPattern);
        });
        return source;
    }

    /**
     * Adds the requested fields to the query object for creating a magento query
     * 
     * @param {object}      queryObject     
     * @returns {object}    
     */
    addFields(object) {
        // iterate through all the rootfields (only searchProducts for now)
        Object.keys(object).forEach(rootField => {
            let obj = object[rootField];
            //may use cases for different rootFields later...
            //but for now map results object if asked for and ignore the others
            obj.results = obj.results ? this._addFields(obj.results) : undefined;
        });
        return object;
    }

    /**
     * @private
     */
    _addFields(product) {
        //create a simpleFields array for base objects (product in this place) (used in templates for creating query)
        product.simpleFields = [];
        //iterate through all the allowed basic fields and add them into object's simpleField array if present
        this.simpleFields.forEach(sf => {
            if (product[sf]) {
                product.simpleFields.push(sf);
                delete product[sf]; //don't need it anymore, could cause heavy payload when many properties
            }
        });
        //cifProductID = magentoProductSKU => ask for magento sku when cif is queried
        if (product.id) {
            product.simpleFields.push("sku");
            delete product.id;
        }

        //masterVariantId needs either sku of first variant or same sku
        if (product.masterVariantId && (!product.variants || !product.variants.sku)) {
            if (product.variants) {
                product.variants.sku = true;
            } else {
                product.variants = { sku: true };
            }
        }
        delete product.masterVariantId;

        this._addPrice(product);
        this._addAssets(product);
        this._addAttributes(product);
        this._addVariants(product);
        this._addCategories(product);
        return product;
    }
    /**
     * @private
     */
    _addCategories(product) {
        let categories = product.categories;
        if (categories) {
            //TODO: handle rest of categoryFields (make children recursive)
            categories.simpleFields = ['id'];
        }
    }

    /**
     * @private
     */
    _addPrice(product) {
        let cifPrice = product.prices
        if (cifPrice) {
            let priceFields = product.priceFields = [];
            Object.keys(cifPrice).forEach(priceField => {
                priceFields.push(priceField);
            });
            delete product.prices;
        }
    }

    /**
     * @private
     */
    _addAssets(product) {
        if (product.assets) {
            //in this case only one asset - image - wich is a simple field in magento
            product.simpleFields = product.simpleFields.concat(this.assets);
            delete product.assets;
        }
    }

    /**
     * @private
     */
    _addAttributes(product) {
        if (product.attributes) {
            //in this case all attributes are simple fields in magento
            product.simpleFields = product.simpleFields.concat(this.attributes);
            delete product.attributes;
        }
    }

    /**
     * @private
     */
    _addVariants(product) {
        if (product.variants) {
            //need configurable_options only when asked for value or isVariantAxis
            if (product.variants.attributes && (product.variants.attributes.value || product.variants.attributes.isVariantAxis)) {
                product.configurable_options = true;
            }
            if (product.variants.available) {
                product.variants.sku = true; //prevent empty magento query
                delete product.variants.available
            }
            this._addFields(product.variants);
        }
    }
}

module.exports = ToMagentoMapper;