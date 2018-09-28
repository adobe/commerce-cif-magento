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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');

const { gqlToObject, makeGraphqlQuery } = require('../../../commerce-cif-common/src/graphql/utils');
const ObjectTransformer = require('../../../commerce-cif-common/src/graphql/ObjectTransformer');
const MagentoTransforms = require('./CIFtoMagentoTransforms');
const transformer = new ObjectTransformer(MagentoTransforms);
const graphqlBase = require('../../../commerce-cif-common/src/graphql/introspectionHandler').main;
const ArgsTransformer = require('../../../commerce-cif-common/src/graphql/ArgsTransformer');
const { argsTransforms, checkFields } = require('./CIFtoMagentoArgs');

const argsTransformer = new ArgsTransformer(argsTransforms, checkFields, '__args');

const ObjectMapper = require('../../../commerce-cif-common/src/graphql/ResponseMapper');
const MagentoToCIFMapper = require('./MagentoToCIFMapper');
const mapper = new ObjectMapper(MagentoToCIFMapper);

function main(args) {
    return graphqlBase(args, magentoDataHandler);
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

    let originalQueryObject = gqlToObject(parse(query).definitions[0]); //transform into JS object

    let MagentoObject = JSON.parse(JSON.stringify(originalQueryObject));
    const client = new MagentoClientBase(args, null, null, 'graphql');

    transformer.transform(MagentoObject);
    try {
        argsTransformer.transformRecursive(MagentoObject);
    } catch (e) {
        return client._handleError(e);
    }

    const options = buildRequest(makeGraphqlQuery(MagentoObject));

    return request(options)
            .then(response => {
                let body;
                if (response.body.errors) {
                    let errors = response.body.errors;
                    errors.forEach(e => {
                        delete e.locations; //locations do not always match CIF query
                    });
                    body = response.body;
                } else {
                    body = { data: mapper.map(originalQueryObject, response.body.data) };
                }

                return client._handleSuccess(body); 
            })
            .catch(e => {
                console.log(e);
                return client._handleError(e);
            });
}

/**
 * 
 * @private 
 */
function buildRequest(query) {
    return {
        uri: "http://master-7rqtwti-7ztex4hq2b6mu.us-3.magentosite.cloud/graphql",
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