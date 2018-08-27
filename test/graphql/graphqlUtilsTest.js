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

const { parse } = require('../../src/graphql/node_modules/graphql');
const { makeExecutableSchema } = require('../../src/graphql/node_modules/graphql-tools');
const { gqlToObject, validateAndParseQuery } = require('../../src/graphql/utils/graphqlUtils');
const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;
  
describe('GraphQL utilities', () => {

    const gqlQuery = `
        query {
            pets {
                name
                age
                owner {
                    gender
                    age
                }
            }
        }
    `;
    const gqlObj = {
        pets: {
            name: true,
            age: true,
            owner: {
                gender: true,
                age: true
            }
        }
    };
    const typeDefs = `
        type Query {
            pets: [Animal]
            quro(text: String, filter: [String]): Human
        }

        type Animal {
            kind: String!
            name: String!
            age: Int
            owner: Human
        }

        type Human {
            gender: String
            name: String!
            age: Int
        }
    `;

    describe('Unit Tests', () => {
        it('transforms a graphql query into a json object', () => {
            try {
                let doc = parse(gqlQuery);
                let object = gqlToObject(doc.definitions[0]);
                assert.deepEqual(object, gqlObj);
            } catch (e) {
                console.log('There was an error in parsing the query');
                throw e;
            }
        });

        it('returns document of a valid query', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), gqlQuery);
            assert.deepEqual(doc, parse(gqlQuery));
        });

        it('throws syntax error', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), '{pets { pets }');
            assert.hasAllKeys(doc, 'errors');
            let errors = doc.errors;
            assert.isArray(errors);
            let err = errors[0];
            assert.startsWith(err.message, "Syntax Error:");
        });

        it('Throws error for invalid field', () => {
            let doc = validateAndParseQuery(makeExecutableSchema({ typeDefs }), '{pets { animals }}');
            assert.hasAllKeys(doc, 'errors');
            let errors = doc.errors;
            assert.isArray(errors);
            let err = errors[0];
            assert.startsWith(err.message, "Cannot query field");
        });

        it('parses arguments correctly', () => {
            let text = "hi";
            let q = `{
                quro(text: ${text}, filter: ["filter"]) {
                    gender
                }
            }`
            let o = gqlToObject(parse(q).definitions[0])
            assert.hasAllKeys(o, 'quro');
            assert.containsAllKeys(o.quro, 'args');
            assert.hasAnyKeys(o.quro.args, ["text", "filter"])
            assert.equal(o.quro.args.text, text);
            assert.isArray(o.quro.args.filter);
        });
    });
});