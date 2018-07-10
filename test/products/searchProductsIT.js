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
const categoriesConfig = require('../lib/config').categoriesConfig;

const expect = chai.expect;
chai.use(require("chai-sorted"));
chai.use(chaiHttp);


describe('magento searchProducts', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let WOMENSHORTS_CATEGORY_ID = null;
        let MEN_CATEGORY_ID = null;

        before(function () {
            return chai.request(env.openwhiskEndpoint)
                    .get(env.categoriesPackage + 'getCategories')
                    .query({
                        type: 'tree'
                    })
                    .then(function (res) {
                        MEN_CATEGORY_ID = parseInt(res.body.results.find(o => {
                            return o.name.en === categoriesConfig.MEN.name
                        }).id);
                        WOMENSHORTS_CATEGORY_ID = parseInt(res.body.results.find(o => {
                            return o.name.en === categoriesConfig.WOMEN.name
                        }).subCategories.find(o => {
                            return o.name.en === categoriesConfig.WOMEN.SHORTS.name;
                        }).id);
                    });
        });

        it('returns a 500 error if parameters are missing', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        it('returns products in a category', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.count).to.equal(4);
                    expect(res.body.results).to.have.lengthOf(4);
                    for(let result of res.body.results) {
                        expect(result.categories).to.deep.include({"id": WOMENSHORTS_CATEGORY_ID});
                    }
                })
                .catch(function(err) {
                    throw err;
                });
        });

        //https://github.com/magento/graphql-ce/issues/89
        it.skip('returns products in a category and all its subcategories', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:subtree("${MEN_CATEGORY_ID}")`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.count).to.equal(25);
                    expect(res.body.results).to.have.lengthOf(25);
                    for(let result of res.body.results) {
                        expect(result.categories).to.have.lengthOf.at.least(1);
                    }
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('returns a product with a given SKU', function() {
            const sku = 'meskwielt';
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `variants.sku:"${sku}"`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.count).to.equal(1);

                    // Verify structure
                    const product = res.body.results[0];
                    expect(product).to.have.own.property('name');
                    expect(product.name.en).to.equal('El Gordo Down Jacket');
                    expect(product).to.have.own.property('masterVariantId');
                    expect(product).to.have.own.property('id');
                    expect(product).to.have.own.property('categories');
                    expect(product).to.have.own.property('variants');
                    expect(product).to.have.own.property('createdDate');
                    expect(product.variants).to.have.lengthOf(15);
                    expect(product.attributes).to.have.lengthOf(2);
                    expect(product.attributes.find(o => {return o.id === 'summary'})).to.be.an('object');
                    expect(product.attributes.find(o => {return o.id === 'features'})).to.be.an('object');
                    //only product variant contains variants attributes
                    expect(product.variants[0].attributes.find(o => {return o.id === 'color'})).to.be.an('object');
                    expect(product.variants[0].attributes.find(o => {return o.id === 'size'})).to.be.an('object');
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('returns products matching a search string', function() {
            const searchTerm = 'jacket';
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    text: searchTerm
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.count).to.equal(5);
                    expect(res.body.results).to.have.lengthOf(5);
                    expect(res.text.split(searchTerm)).to.have.lengthOf.at.least(5);
                })
                .catch(function(err) {
                    throw err;
                });
        });

        it('returns products sorted by their name', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`,
                    sort: 'name.en.desc',
                    limit: 5
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.count).to.equal(4);
                    expect(res.body.results).to.have.lengthOf(4);

                    // Verfiy sorting
                    const names = res.body.results.map(r => r.name.en);
                    expect(names).to.be.descending;
                })
                .catch(function(err) {
                    throw err;
                });
        });

        //TODO - review this when we agree and implement search syntax
        it.skip('returns a 500 error for invalid sorting parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`,
                    sort: 'abc.asc'
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

        //https://github.com/magento/graphql-ce/issues/89
        it.skip('returns a subset of products as defined by paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:subtree("${MEN_CATEGORY_ID}")`,
                    limit: 4,
                    offset: 20
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.offset).to.equal(20);
                    expect(res.body.count).to.equal(4);
                    expect(res.body.total).to.equal(100);
                    expect(res.body.results).to.have.lengthOf(4);
                })
                .catch(function(err) {
                    throw err;
                });
        });

        //TODO - review this when we agree and implement search syntax
        it.skip('returns a 500 error for invalid paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .query({
                    filter: `categories.id:subtree:"${MEN_CATEGORY_ID}"`,
                    limit: -1
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                });
        });

    });
});