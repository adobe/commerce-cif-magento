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
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');
const setup = require('../lib/setupIT.js').setup;
const requiredFields = require('../lib/requiredFields');

const expect = chai.expect;
chai.use(require("chai-sorted"));
chai.use(require("chai-string"));
chai.use(chaiHttp);

const {
    allFieldsQuery,
    introspectionQuery,
    pricesQuery,
    attributesQuery,
    assetsQuery,
    categoriesQuery,
    variantsQuery,
    syntaxError,
    invalidField,
    filterAndTextMissing
} = require('../resources/graphqlQueries');

describe('CIF/Magento graphql', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        it('Returns GraphQL Schema for introspection query', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: introspectionQuery })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.data).to.have.ownProperty("__schema");
                });
        });

        it('Product data contains all fields with filter parameter', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: allFieldsQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);

                    const pagedResponse = res.body.data.searchProducts;
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

                    //only product variant contains variants attributes
                    expect(product.variants[0].attributes.find(o => {return o.id === 'color'})).to.be.an('object');
                    expect(product.variants[0].attributes.find(o => {return o.id === 'size'})).to.be.an('object');
                });
        });

        it('Product response only contains product variants data', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: variantsQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    
                    // Verify structure
                    const product = res.body.data.searchProducts.results[0];
                    expect(product).to.have.own.property('variants');
                    expect(product.variants).to.have.lengthOf(15);

                    product.variants.forEach(variant => {
                        requiredFields.verifyProductVariant(variant);
                        expect(variant).to.have.own.property('createdAt');
                        expect(variant).to.have.own.property('lastModifiedAt');
                        expect(variant).to.have.own.property('description');
                        expect(variant).to.have.own.property('attributes');
                        expect(variant).to.have.own.property('assets');
                    });

                    // Product JSON should only contain "variants" array
                    expect(Object.keys(product)).to.have.lengthOf(1);
                });
        });

        it('Product response only contains product prices', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: pricesQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    
                    // Verify structure
                    const product = res.body.data.searchProducts.results[0];
                    expect(product).to.have.own.property('prices');
                    expect(product.prices).to.have.lengthOf(1);

                    const price = product.prices[0];
                    requiredFields.verifyPrice(price);

                    // Product JSON should only contain "prices" array
                    expect(Object.keys(product)).to.have.lengthOf(1);
                });
        });

        it('Product response only contains product assets', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: assetsQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    
                    // Verify structure
                    const product = res.body.data.searchProducts.results[0];
                    expect(product).to.have.own.property('assets');
                    expect(product.assets).to.have.lengthOf(1);

                    const asset = product.assets[0];
                    requiredFields.verifyAsset(asset);
                    expect(asset.url).to.startsWith('http');

                    // Product JSON should only contain "assets" array
                    expect(Object.keys(product)).to.have.lengthOf(1);
                });
        });

        it('Product response only contains product attributes and variants attributes', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: attributesQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    
                    const productAttributes = ['features', 'summary'];
                    const variantAttributes = ['color', 'size'];
                    const allAttributes = productAttributes.concat(variantAttributes);

                    // Verify structure
                    const product = res.body.data.searchProducts.results[0];
                    expect(product).to.have.own.property('attributes');
                    expect(product.attributes).to.have.lengthOf(productAttributes.length);
                    product.attributes.forEach(attribute => {
                        expect(attribute.id).to.be.oneOf(productAttributes);
                    });

                    expect(product.attributes[0].id).to.be.oneOf(productAttributes);
                    expect(product.attributes[1].id).to.be.oneOf(productAttributes);

                    expect(product.variants).to.have.lengthOf(15);
                    product.variants.forEach(variant => {
                        expect(variant.attributes).to.have.lengthOf(allAttributes.length);
                        variant.attributes.forEach(attribute => {
                            expect(attribute.id).to.be.oneOf(allAttributes);
                            expect(attribute.isVariantAxis).to.equal(variantAttributes.includes(attribute.id));
                            expect(attribute).to.have.own.property('name');
                            expect(attribute).to.have.own.property('value');
                        });
                    });

                    // Product JSON should only contain "attributes" and "variants" properties
                    expect(Object.keys(product)).to.have.lengthOf(2);
                });
        });

        it('Product response only contains product categories', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: categoriesQuery })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    
                    // Verify structure
                    const product = res.body.data.searchProducts.results[0];
                    expect(product).to.have.own.property('categories');
                    expect(product.categories).to.have.lengthOf(1);

                    const category = product.categories[0];
                    requiredFields.verifyCategory(category);

                    // Product JSON should only contain "categories" array
                    expect(Object.keys(product)).to.have.lengthOf(1);
                });
        });

        it('Returns a syntax error response to a malformed query', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: syntaxError })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    const error = res.body.errors[0];
                    expect(error.message).to.startsWith('Syntax Error');
                });
        });

        it('Returns an invalid field error response to an invalid query', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: invalidField })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    const error = res.body.errors[0];
                    expect(error.message).to.startsWith('Cannot query field');
                });
        });

        it('Returns an error message when mandatory search fields are missing', function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.graphqlPackage + 'graphql')
                .set('Cache-Control', 'no-cache')
                .send({ query: filterAndTextMissing })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);
                    const error = res.body.errors[0];
                    expect(error.message).to.equal("'search' or 'filter' input argument is required.");
                    expect(error.category).to.equal('graphql-input');
                    expect(error.path[0]).to.equal('searchProducts');
                });
        });
    });
});