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
const { ifCond } = require('./common/handlebarsHelpers');
handlebars.registerHelper('ifCond', ifCond);
const fs = require('fs');
const ArgsHandler = require('./utils/ArgsHandler');
const magentoArgs = require('./lib/CIFToMagentoArgsMapper').magentoArguments;
const obligatoryArgs = require('./lib/CIFToMagentoArgsMapper').obligatoryArguments;

/**
 * Uses magento templates to build a magento graphql query
 */
class GraphQlRequestBuilder {

    /**
     * @param {string} endpoint     graphql endpoint for query
     * @param {object} context      context to use in template
     */
    constructor(endpoint, context) {
        this.endpoint = endpoint;
        this.context = context;
    }

    /**
     * prepares http request
     */
    build() {
        // Generate query
        this._handleArgs();
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

    _handleArgs() {
        let handler = new ArgsHandler(magentoArgs, obligatoryArgs, "args");
        handler.handleWholeObject(this.context);
    }

    _generateQuery() {
        let productTemplate = fs.readFileSync(__dirname + '/magentoProduct.graphql', 'utf8');
        handlebars.registerPartial("product", productTemplate)
        let queryTemplate = fs.readFileSync(__dirname + '/query.graphql', 'utf8');
        let compiledTemplate = handlebars.compile(queryTemplate);
        return compiledTemplate(this.context);
    }

}

module.exports = GraphQlRequestBuilder;