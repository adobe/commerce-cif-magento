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
const HttpStatus = require('http-status-codes');
const setup = require('../lib/setupIT.js').setup;
const categoriesConfig = require('../lib/config').categoriesConfig;
const requiredFields = require('../lib/requiredFields');
const expect = chai.expect;

chai.use(require('chai-sorted'));
chai.use(require('chai-http'));

describe('magento getCategories', function() {

    describe('Integration tests', function() {
        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let MEN_CATEGORY_ID = null;
        let MEN_CATEGORY_SLUG = null;
        let accessToken;

        before(function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree'
                })
                .then(function (res) {
                    expect(res).to.have.status(HttpStatus.OK);

                    const menCategory = res.body.results.find(o => o.name === categoriesConfig.MEN.name);
                    MEN_CATEGORY_ID = menCategory.id;
                    MEN_CATEGORY_SLUG = menCategory.slug;

                    // doing a customer login to also test that the customer token header
                    // will not override the integration token
                    return chai.request(env.openwhiskEndpoint)
                        .post(env.customersPackage + '/auth')
                        .set('Cache-Control', 'no-cache')
                        .query({
                            type: 'credentials',
                            email: env.magentoCustomerName,
                            password: env.magentoCustomerPwd
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.access_token).to.not.be.undefined;
                });
        });

        it('returns all categories in tree structure', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({
                    type: 'tree'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(21);
                    expect(res.body.results).to.have.lengthOf(3);

                    // Verify structure
                    for(let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                        expect(category).to.have.own.property('children');
                        for(let subCategory of category.children) {
                            expect(subCategory).to.have.own.property('parents');
                        }
                    }
                });
        });

        it('returns all categories in flat structure', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'flat'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(21);
                    expect(res.body.results).to.have.lengthOf(21);

                    // Verify structure
                    for(let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                        expect(category).to.not.have.own.property('children');
                    }
                });
        });

        it('returns a single category by ID', function() {
            const categoryId = MEN_CATEGORY_ID;
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + `/${categoryId}`)
                .set('Cache-Control', 'no-cache')
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    const category = res.body;
                    requiredFields.verifyCategory(category);
                    expect(category).to.have.own.property('name');
                    expect(category.name).to.equal('Men');
                    expect(category).to.have.own.property('lastModifiedAt');
                    expect(category).to.have.own.property('createdAt');
                });
        });

        it('returns a single category by slug', () => {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + `/slug/${MEN_CATEGORY_SLUG}`)
                .set('Cache-Control', 'no-cache')
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    const category = res.body;
                    requiredFields.verifyCategory(category);
                    expect(category).to.have.own.property('id');
                    expect(category.id).to.equal(MEN_CATEGORY_ID);
                    expect(category).to.have.own.property('slug');
                    expect(category.slug).to.equal(MEN_CATEGORY_SLUG);
                });
        });

        it('returns all categories in a tree structure with only root nodes', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree',
                    depth: '0'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.count).to.equal(3);
                    expect(res.body.results).to.have.lengthOf(3);

                    // Verify structure
                    for(let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                        expect(category).to.not.have.own.property('children');
                    }
                });
        });

        //magento sorting is not working - skip for now.
        it.skip('returns all categories in tree structure sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree',
                    sort: 'name.desc'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    for (let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                    }

                    // Verfiy sorting
                    const names = res.body.results.map(r => r.name);
                    expect(names).to.be.descending;
                });
        });

        //magento sorting is not working - skip for now.
        it.skip('returns all categories in tree structure with children sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree',
                    sort: 'name.desc'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);

                    // Verify sorting of children
                    for(let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                        const subnames = category.children.map(r => r.name);
                        expect(subnames).to.be.descending;
                    }
                });
        });

        //magento sorting is not working - skip for now.
        it.skip('returns all categories in flat structure sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'flat',
                    sort: 'name.desc'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    for (let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                    }

                    // Verfiy sorting
                    const names = res.body.results.map(r => r.name);
                    expect(names).to.be.descending;
                });
        });

        //magento pagination is not working - skip for now.
        it.skip('returns a subset of categories in tree structure as defined by paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'tree',
                    limit: 5,
                    offset: 10
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.offset).to.equal(10);
                    expect(res.body.count).to.equal(5);
                    expect(res.body.total).to.equal(24);
                    expect(res.body.results).to.have.lengthOf(5);
                    for (let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                    }
                });
        });

        //magento pagination is not working - skip for now.
        it.skip('returns a subset of categories in flat structure as defined by paging parameters', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({
                    type: 'flat',
                    limit: 7,
                    offset: 14
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);
                    expect(res.body.offset).to.equal(14);
                    expect(res.body.count).to.equal(7);
                    expect(res.body.total).to.equal(24);
                    expect(res.body.results).to.have.lengthOf(7);
                    for (let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                    }
                });
        });

        it('returns a 400 error for invalid paging parameters', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Cache-Control', 'no-cache')
                .query({ limit: -7 })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 404 error for a non existent category by id', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + `/999999`)
                .set('Cache-Control', 'no-cache')
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 404 error for a non existent category by slug', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + `/slug/does-not-exist`)
                .set('Cache-Control', 'no-cache')
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns the Vary header', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage)
                .set('Authorization', `Bearer ${accessToken}`)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res).to.haveOwnProperty('header');
                    expect(res.header).to.haveOwnProperty('vary');
                    expect(res.header.vary).to.equal('Accept-Language');
                });
        });
    });
});