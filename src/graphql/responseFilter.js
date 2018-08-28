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
 * filters a 'result' object to return only the fields present int 'query'
 * 
 * @param {Object} result      result object
 * @param {Object} query       query object
 * 
 * @returns {Object}           object containing all fields in query with value of corresponding result field or null if not present in result object
 */
function filter(result, query) {
    let filtered = {};
    Object.keys(query).forEach(rootField => {
        //only handle searchProducts field for now
        if (rootField === "searchProducts") {
            //rrf = result root field, qrf = query root field
            let rrf = filtered[rootField] = {};
            let qrf = query[rootField];
            Object.keys(qrf).forEach(field => {
                //should be fields of PagedResponse in this case
                //only filter results field with product fiels queried for in qrf
                rrf[field] = field === "results" ? result.results.map(p => filterProduct(p, qrf.results)) : result[field];
            });
            delete rrf.args; //deletes arguments if available
        } else {
            //later further implementations for other fields
            filtered[rootField] = "not searchProductsField";
        }
    });
    return filtered;
}

/**
 * handles array objects
 * 
 * @param {Object} productObject
 * @param {Object} queryObject 
 */
function arrayField(productObject, queryObject) {
    let arr = [];
    //use a map?
    productObject.forEach(obj => {
        let o = {};
        Object.keys(queryObject).forEach(f => {
            o[f] = obj[f] !== undefined ? obj[f] : null; //null if result doen't contain queried field
        });
        arr.push(o);
    });
    return arr;
}

/**
 * 
 * filters a magento product
 * 
 * @param {object} product       product as received from result 
 * @param {object} queryObject   originally queried product fields
 */
function filterProduct(product, queryObject) {
    let response = {};
    Object.keys(queryObject).forEach(field => {
        response[field] = null;
        if (product[field]) {
            switch (field) {
                case "prices":
                case "categories":
                case "attributes":
                case "assets":
                    response[field] = arrayField(product[field], queryObject[field]);
                    break;
                case "variants":
                    response.variants = product.variants.map(v => filterProduct(v, queryObject.variants));
                    break;
                default:
                    response[field] = product[field];
                    break;
            }
        }
    });
    delete response.args; //deletes arguments if available  
    return response;
}

module.exports.filter = filter;