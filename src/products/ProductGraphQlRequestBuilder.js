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

const handlebars = require('handlebars');
const fs = require('fs');
const InvalidArgumentError = require('@adobe/commerce-cif-common/exception').InvalidArgumentError;

class ProductGraphQlRequestBuilder {

    constructor(endpoint, template, requestArgs) {
        this.endpoint = endpoint;
        this.requestArgs = requestArgs;
        this.template = template;
        this.context = {};
    }

    build() {
        // Parse arguments
        this._parsePagination();
        this._parseFullTextSearch();
        this._parseSorting();
        this._parseFilter();
        this._parseAttributes();

        if (this.context.filter.length == 0 && !('search' in this.context)) {
            throw new InvalidArgumentError("The request did't include any valid search filter or text argument");
        }

        // Generate query
        let query = this._generateQuery();

        return {
            method: 'POST',
            uri: this.endpoint,
            body: {
                query: query,
                operationName: null,
                variables: null
            },
            headers: {
                'Store': 'default'
            },
            json: true,
            resolveWithFullResponse: true
        };
    }

    _parseAttributes() {
        this.context.attributes = this.requestArgs.GRAPHQL_PRODUCT_ATTRIBUTES || [];
    }

    _parseFilter() {
        let filterArgs = this.requestArgs.filter ? this.requestArgs.filter.split('|') : [];
        let filterFields = [];

        filterArgs.forEach((filterArg) => {
            // Translate field names
            let field = ProductGraphQlRequestBuilder._translateFieldName(filterArg);

            // Parse value
            let value;
            let split = filterArg.split(':');
            if (split.length == 2) {
                let val = split[1];
                let matches = val.match(/.*?"(.*?)".*/);
                if (matches) {
                    value = matches[1];
                }
            }

            if (field && value) {
                filterFields.push({field: field, value: value});
            }
        });

        return Object.assign(this.context, {filter: filterFields});
    }

    _parseSorting() {
        let sortArgs = this.requestArgs.sort ? this.requestArgs.sort.split('|') : [];
        let sortFields = [];

        sortArgs.forEach((sortArg) => {
            // Get direction
            let direction = 'ASC';
            if (sortArg.split('.').slice(-1)[0] == 'desc') {
                direction = 'DESC';
            }

            // Translate field names
            let field = ProductGraphQlRequestBuilder._translateFieldName(sortArg);
            if (field) {
                sortFields.push({field: field, direction: direction});
            }
        });

        return Object.assign(this.context, {sort: sortFields});
    }

    static _translateFieldName(field) {
        if (field.startsWith('name')) {
            return 'name';
        }
        if (field.startsWith('price')) {
            return 'price';
        }
        if (field.startsWith('categories.id')) {
            return 'category_id';
        }
        if (field.startsWith('variants.sku')) {
            return 'sku';
        }
        return null;
    }

    _parsePagination() {
        let limit = Number(this.requestArgs.limit);
        if (!limit || limit < 0) {
            limit = 25;
        }
        let offset = Number(this.requestArgs.offset);
        if (!offset || offset < 0) {
            offset = 0;
        }

        let currentPage = 1;
        if (limit > 0 && offset % limit === 0) {
            currentPage = (offset / limit) + 1;
        }

        return Object.assign(this.context, {
            'pageSize': limit, 
            'currentPage': currentPage
        });
    }

    _parseFullTextSearch() {
        if (!('text' in this.requestArgs)) {
            return;
        }
        let text = this.requestArgs.text;
        return Object.assign(this.context, {
            'search': text
        });
    }

    _generateQuery() {
        let queryTemplate = fs.readFileSync(this.template, 'utf8');
        let compiledTemplate = handlebars.compile(queryTemplate);
        return compiledTemplate(this.context);
    }

}

module.exports = ProductGraphQlRequestBuilder;