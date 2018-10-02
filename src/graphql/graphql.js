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

const request = require('request-promise-native');
const { parse } = require('graphql');
const { gqlToObject, makeGraphqlQuery } = require(__dirname + '/../../../commerce-cif-common/src/graphql/utils');
const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');

const ObjectTransformer = require(__dirname + '/../../../commerce-cif-common/src/graphql/ObjectTransformer');
const magentoTransformRules = require('./magentoTransformRules');
const transformer = new ObjectTransformer(magentoTransformRules);

const introspectionHandler = require(__dirname + '/../../../commerce-cif-common/src/graphql/introspectionHandler');

const ArgsTransformer = require(__dirname + '/../../../commerce-cif-common/src/graphql/ArgsTransformer');
const { transformerFunctions, checkFields } = require('./magentoArgsTransformer');
const argsTransformer = new ArgsTransformer(transformerFunctions, checkFields, '__args');

const ResponseMapper = require(__dirname + '/../../../commerce-cif-common/src/graphql/ResponseMapper');
const magentoMapper = require('./magentoMapper');
const mapper = new ResponseMapper(magentoMapper);

function main(args) {
    return introspectionHandler(args, magentoDataHandler);
}

/**
 * This action handles incoming GraphQL data queries for Magento backend.
 * 
 * @param   {GraphQLSource} args.query      entering GraphQL query
 * 
 * @return  {Promise.<ExecutionResult>}
 */
function magentoDataHandler(args) {
    let query = args.query;
    let queryObject = gqlToObject(parse(query).definitions[0]); //transform into JS object

    let magentoQueryObject = JSON.parse(JSON.stringify(queryObject));
    const client = new MagentoClientBase(args, null, null, 'graphql');

    transformer.transform(magentoQueryObject);
    try {
        argsTransformer.transformRecursive(magentoQueryObject);
    } catch (e) {
        console.error(e);
        return client._handleError(e);
    }

    const options = _buildRequest(args, makeGraphqlQuery(magentoQueryObject));

    return request(options)
            .then(response => {
                let body;
                if (response.body.errors) {
                    body = response.body;
                } else {
                    body = { data: mapper.map(queryObject, response.body.data) };
                }
                return client._handleSuccess(body); 
            })
            .catch(e => {
                console.error(e);
                return client._handleError(e);
            });
}

/**
 * @private 
 */
function _buildRequest(args, query) {
    return {
        uri: `${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/graphql`,
        method: "POST",
        headers: {
            'Store': 'default',
            'Content-Type': 'application/json',
        },
        json: true,
        body: {
            query: query,
            operationName: null,
            variables: null
        },
        resolveWithFullResponse: true
    };
}

module.exports.main = main;