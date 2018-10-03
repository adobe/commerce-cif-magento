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

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.use(require("chai-string"));
const setup = require('../lib/setupTest').setup;
const config = require('../lib/config').config;
const requiredFields = require('../lib/requiredFields');
const HttpStatus = require('http-status-codes');

const { allFieldsQuery, syntaxError, invalidField } = require('../resources/graphqlQueries');
const sampleResponse = require('../resources/sample-graphql-transformed-product-search');

describe('Unit tests', () => {

    describe('CIF/Magento graphql', () => {

        setup(this, __dirname, 'graphql');

        it('Product data contains all fields with filter parameter', () => {
            return this.prepareResolve(sampleResponse, (expectedArgs) => {
                    assert.equal(expectedArgs.method, "POST");
                    assert.isTrue(expectedArgs.resolveWithFullResponse, true);
                    assert.equal(expectedArgs.uri, `${config.MAGENTO_SCHEMA}://${config.MAGENTO_HOST}/graphql`);
                    assert.isDefined(expectedArgs.body.query);
                    assert.isDefined(expectedArgs.body.operationName);
                    assert.isDefined(expectedArgs.body.variables);
                })
                .execute(Object.assign({
                    'query': allFieldsQuery
                }, config))
                .then(result => {
                    assert.isDefined(result.response.body);
                    const pagedResponse = result.response.body.data.searchProducts;
                    requiredFields.verifyPagedResponse(pagedResponse);
                    expect(pagedResponse.count).to.equal(1);

                    // Verify structure
                    const product = pagedResponse.results[0];
                    requiredFields.verifyProduct(product);
                    expect(product.name).to.equal('El Gordo Down Jacket');
                    expect(product).to.have.own.property('categories');
                    expect(product).to.have.own.property('createdAt');

                    expect(product.variants).to.have.lengthOf(15);
                    expect(product.attributes).to.have.lengthOf(2);

                    expect(product.attributes.find(o => {return o.id === 'summary'})).to.be.an('object');
                    expect(product.attributes.find(o => {return o.id === 'features'})).to.be.an('object');

                    expect(product.variants[0].attributes.find(o => {return o.id === 'color'})).to.be.an('object');
                    expect(product.variants[0].attributes.find(o => {return o.id === 'size'})).to.be.an('object');

                    let urlPrefix = `${config.MAGENTO_SCHEMA}://${config.MAGENTO_HOST}/${config.MAGENTO_MEDIA_PATH}`;
                    expect(product.assets[0].url).to.startsWith(urlPrefix);
                });
        });

        it('Search arguments are properly mapped to Magento arguments', () => {
            let params = 'searchProducts(text: "test", filter: "sku:meskwielt", offset: 3, limit: 3)';
            let query = allFieldsQuery.replace(/searchProducts\(.*\)/, params);
            return this.prepareResolve(sampleResponse, (expectedArgs) => {
                    expect(expectedArgs.body.query).to.contains('searchProducts: products (filter: {sku: {eq: "meskwielt"}}');
                    expect(expectedArgs.body.query).to.contains('search: "test"');
                    expect(expectedArgs.body.query).to.contains('currentPage: 2');
                    expect(expectedArgs.body.query).to.contains('pageSize: 3');
                })
                .execute(Object.assign({
                    'query': query
                }, config));
        });

        it('Invalid paging arguments are properly handled', () => {
            let params = 'searchProducts(text: "test", offset: -1, limit: -1)';
            let query = allFieldsQuery.replace(/searchProducts\(.*\)/, params);
            return this.prepareResolve(sampleResponse, (expectedArgs) => {
                    expect(expectedArgs.body.query).to.contains('currentPage: 1');
                    expect(expectedArgs.body.query).to.contains('pageSize: 25');
                })
                .execute(Object.assign({
                    'query': query
                }, config));
        });

        it('Correctly processes multiple filter parameters', () => {
            let params = 'searchProducts(filter: ["variants.sku:meskwielt", "categories.id:3"])';
            let query = allFieldsQuery.replace(/searchProducts\(.*\)/, params);
            return this.prepareResolve(sampleResponse, (expectedArgs) => {
                    expect(expectedArgs.body.query).to.contains('searchProducts: products (filter: {sku: {eq: "meskwielt"}, category_id: {eq: "3"}})');
                })
                .execute(Object.assign({
                    'query': query
                }, config));
        });

        it('Correctly processes multiple sort parameters', () => {
            let params = 'searchProducts(text: "test", sort: ["name.asc", "sku.desc", "createdAt.asc", "lastModifiedAt.desc"])';
            let query = allFieldsQuery.replace(/searchProducts\(.*\)/, params);
            return this.prepareResolve(sampleResponse, (expectedArgs) => {
                    expect(expectedArgs.body.query).to.contains('sort: {name: ASC, sku: DESC, created_at: ASC, updated_at: DESC}');
                })
                .execute(Object.assign({
                    'query': query
                }, config));
        });

        it('Returns a syntax error response to a malformed query', () => {
            return this.prepareResolve(sampleResponse)
                .execute(Object.assign({
                    'query': syntaxError
                }, config))
                .then(result => {
                    expect(result.response.statusCode).to.equal(HttpStatus.OK);
                    const error = result.response.body.errors[0];
                    expect(error.message).to.startsWith('Syntax Error');
                });
        });

        it('Returns an invalid field error response to an invalid query', () => {
            return this.prepareResolve(sampleResponse)
                .execute(Object.assign({
                    'query': invalidField
                }, config))
                .then(result => {
                    expect(result.response.statusCode).to.equal(HttpStatus.OK);
                    const error = result.response.body.errors[0];
                    expect(error.message).to.startsWith('Cannot query field');
                });
        });

        it('Properly returns error responses', () => {
            return this.prepareResolve({
                    body: {
                        errors: [{
                            message: 'This is an error',
                        }]
                    }
                })
                .execute(Object.assign({
                    'query': allFieldsQuery
                }, config))
                .then(result => {
                    expect(result.response.statusCode).to.equal(HttpStatus.OK);
                    const error = result.response.body.errors[0];
                    expect(error.message).to.equal('This is an error');
                });
        });

        it('Properly returns error responses for a failing HTTP request', () => {
            return this.prepareReject(undefined)
                .execute(Object.assign({
                    'query': allFieldsQuery
                }, config))
                .then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                });
        });
    });

});