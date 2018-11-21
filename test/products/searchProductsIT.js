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
const requiredFields = require('../lib/requiredFields');

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
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree'
                })
                .then(function (res) {
                    MEN_CATEGORY_ID = res.body.results.find(o => {
                        return o.name === categoriesConfig.MEN.name
                    }).id.toString();
                    WOMENSHORTS_CATEGORY_ID = res.body.results.find(o => {
                        return o.name === categoriesConfig.WOMEN.name
                    }).children.find(o => {
                        return o.name === categoriesConfig.WOMEN.SHORTS.name;
                    }).id.toString();
                });
        });

        it('returns a 400 error if parameters are missing', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns products in a category', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(4);
                    expect(res.body.results).to.have.lengthOf(4);
                    for (let result of res.body.results) {
                        requiredFields.verifyProduct(result);
                        expect(result.categories).to.deep.include({"id": WOMENSHORTS_CATEGORY_ID});
                    }
                });
        });

        it('returns products in a category and all its children', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:subtree("${MEN_CATEGORY_ID}")`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(21);
                    expect(res.body.results).to.have.lengthOf(21);
                    for (let result of res.body.results) {
                        expect(result.categories).to.have.lengthOf.at.least(1);
                        requiredFields.verifyProduct(result);
                    }
                });
        });

        it('returns a product with a given SKU', function() {
            const sku = 'meskwielt';
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `variants.sku:"${sku}"`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(1);

                    // Verify structure
                    const product = res.body.results[0];

                    requiredFields.verifyProduct(product);
                    expect(product.name).to.equal('El Gordo Down Jacket');
                    expect(product).to.have.own.property('categories');
                    expect(product).to.have.own.property('createdAt');

                    expect(product.variants).to.have.lengthOf(15);
                    expect(product.attributes).to.have.lengthOf(4);
                    expect(product.attributes.find(o => {return o.id === 'summary'})).to.be.an('object');
                    expect(product.attributes.find(o => {return o.id === 'features'})).to.be.an('object');

                    //only product variant contains variants attributes
                    expect(product.variants[0].attributes.find(o => {return o.id === 'color'})).to.be.an('object');
                    expect(product.variants[0].attributes.find(o => {return o.id === 'size'})).to.be.an('object');
                });
        });

        it('returns a valid response with 2 SKUs', function() {
            const sku1 = 'meskwielt';
            const sku2 = 'mesusupis';
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `variants.sku:"${sku1}","${sku2}"`
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(2);
                    expect(res.body.results.find(p => p.sku === sku1)).to.not.be.null;
                    expect(res.body.results.find(p => p.sku === sku2)).to.not.be.null;
                });
        });

        it('returns a valid response with a filter parameter and search string', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: 'categories.id:"11"', // category alone has 6 matches
                    text: 'gloves' // search has 4 matches
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    // Combined request has a single match
                    expect(res.body.count).to.equal(1);
                });
        });

        it('returns products matching a search string', function() {
            const searchTerm = 'jacket';
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    text: searchTerm
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(5);
                    expect(res.body.results).to.have.lengthOf(5);
                    expect(res.text.split(searchTerm)).to.have.lengthOf.at.least(5);
                    for(let result of res.body.results) {
                        requiredFields.verifyProduct(result);
                    }
                });
        });

        it('returns products sorted by their name', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`,
                    sort: 'name.desc',
                    limit: 5
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(4);
                    expect(res.body.results).to.have.lengthOf(4);
                    for(let result of res.body.results) {
                        requiredFields.verifyProduct(result);
                    }

                    // Verfiy sorting
                    const names = res.body.results.map(r => r.name);
                    expect(names).to.be.descending;
                });
        });

        //TODO - review this when we agree and implement search syntax
        it.skip('returns a 500 error for invalid sorting parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:"${WOMENSHORTS_CATEGORY_ID}"`,
                    sort: 'abc.asc'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a subset of products as defined by paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:subtree("${MEN_CATEGORY_ID}")`,
                    limit: 5,
                    offset: 20
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.offset).to.equal(20);
                    expect(res.body.count).to.equal(1);
                    expect(res.body.total).to.equal(21);
                    expect(res.body.results).to.have.lengthOf(1);
                    for(let result of res.body.results) {
                        requiredFields.verifyProduct(result);
                    }
                });
        });

        it('returns a 400 error for invalid paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.productsPackage + 'searchProducts')
                .set('Cache-Control', 'no-cache')
                .query({
                    filter: `categories.id:subtree:"${MEN_CATEGORY_ID}"`,
                    limit: -1
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

    });
});