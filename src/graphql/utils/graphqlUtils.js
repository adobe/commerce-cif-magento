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

const { parse } = require('graphql');
const { validate } = require('graphql/validation');
//const { DocumentNode, DefinitionNode } = require('@types/graphql/language/ast');
//const { Source } = require('@types/graphql/language/source');
//const { GraphQLSchema } = require('@types/graphql/type/definition');

/**
 * Transforms an AST {@link DefinitionNode} into a a javascript object
 * 
 * @param {DefinitionNode} node         DefinitionNode of {@link DocumentNode} of parsed GraphQL source
 * 
 * @returns {Object}                    javascript object representing a GraphQL source
 */
function gqlToObject(node) {
    let object = {};
    if (node.selectionSet) {
        let selections = node.selectionSet.selections;
        //try with map?
        selections.forEach(sel => {
            let name = sel.name.value;
            //TODO: handle alias
            object[name] = gqlToObject(sel);
            if (sel.arguments.length > 0) {
                object[name].args = _parseArguments(sel.arguments);
            }
        })
    } else {
        return true;
    }
    return object;
}

/**
 * @private
 */
function _parseArguments(args) {
    let argsObj = {};
    args.forEach(arg => {
        if (arg.value.fields) {
            argsObj[arg.name.value] = _parseArguments(arg.value.fields);
        } else {
            argsObj[arg.name.value] = arg.value.value || arg.value.values.map(a => a.value);
        }
    });
    return argsObj;
}

/**
 * validates a GraphQL {@link Source} and parses it into a Document {@see DocumentNode}
 * 
 * @param {GraphQLSchema} schema    GraphQLSchema to validate the source against
 * @param {Source} source           Query | Mutation | Subscription
 * 
 * @throws {GraphQLError} if a SyntaxError is encountered
 * @return array of encountered errors or the source's Document if no errors encountered
 */
function validateAndParseQuery(schema, source) {
    let document;
    let err;
    try {
        document = parse(source);
    } catch (e) {
        err = e;
    }
    let errorObject = { errors: document ? validate(schema, document) : [err] };
    return errorObject.errors.length > 0 ? errorObject : document;
}

module.exports = { gqlToObject, validateAndParseQuery };