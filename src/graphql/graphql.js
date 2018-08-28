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

const req = require('request-promise-native');
const { parse, graphql } = require('graphql');
const {makeExecutableSchema} = require('graphql-tools');
const graphqlSchema = require('@adobe/commerce-cif-model').graphqlSchema;
const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');

const ProductMapper = require('@adobe/commerce-cif-magento-product/ProductMapper');
const { validateAndParseQuery, gqlToObject } = require('./utils/graphqlUtils');
const GraphQlRequestBuilder = require('./MagentoGraphQlRequestBuilder');
const ObjectMapper = require('./lib/ToMagentoMapper');
const filter = require('./responseFilter').filter;
const schema = makeExecutableSchema({typeDefs: graphqlSchema});

/**
 * This action handles incoming GraphQL queries.
 * @param   {GraphQLSource} args.query      //entering GraphQL query
 * 
 * @return  {Promise.<ExecutionResult>}
 */
function main(args) {
    let query = args.query || "";
    // DocumentNode of query or encountered errors
    let document = validateAndParseQuery(schema, query);

    const client = new MagentoClientBase(args, null, '', 'graphql');

    if (document.errors || query.includes("__schema") || query.includes("__types")) {
        //let graphql function handle errors and IntrospectionQueries
        return graphql(schema, query, null, null, args.variables, args.operationName)
            .then(result => {
                return client._handleSuccess(result, null);
            })
            .catch(e => {
                return client.handleError(e);
            });
    } else {
        //no IntrospectionQuery => prepare magento query
        //need original query to filter only queried fields in response
        let originalQueryObject = gqlToObject(document.definitions[0]); //transform into JS object
        
        //create cif to magento mapper
        let toMagento = new ObjectMapper(args.MAGENTO_SIMPLEFIELDS, new Map(args.GRAPHQL_FIELD_SUBSTITUTIONS), args.GRAPHQL_PRODUCT_ATTRIBUTES, args.GRAPHQL_PRODUCT_ASSETS);
        //rename cif field to corresponding magento fields
        let newQuery = toMagento.renameFields(query);
        //transform renamed query to a queryObject used to create magento query
        let queryObject = toMagento.addFields(gqlToObject(parse(newQuery).definitions[0]));
        //build magento query with queryObject as context
        let builder = new GraphQlRequestBuilder(`${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/graphql`, queryObject);
        let options;
        try {
            options = builder.build();
        } catch(e) {
            return client.handleError(e);
        }
        return req(options)
            .then(response => {
                let imageUrlPrefix = `${args.MAGENTO_SCHEMA}://${args.MAGENTO_HOST}/${args.MAGENTO_MEDIA_PATH}`;
                let productMapper = new ProductMapper(imageUrlPrefix, args.GRAPHQL_PRODUCT_ATTRIBUTES);
                let pagedResponse = productMapper.mapGraphQlResponse(response.body);
                //filter out only queried fields from originalQueryObject
                let body = {data: filter(JSON.parse(JSON.stringify(pagedResponse)), originalQueryObject)};
                return client._handleSuccess(body, null, response.statusCode);
            })
            .catch((e) => {
                return client.handleError(e);
            });
    }
}

module.exports.main = main;