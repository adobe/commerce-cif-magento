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
chai.use(require('chai-as-promised'));


describe('magento getCategories', function() {

    describe('Integration tests', function() {
        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let MEN_CATEGORY_ID = null;

        before(function () {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
                .query({
                    type: 'tree'
                })
                .then(function (res) {
                    MEN_CATEGORY_ID = parseInt(res.body.results.find(o => {
                        return o.name === categoriesConfig.MEN.name
                    }).id);
                });
        });

        it('returns all categories in tree structure', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
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
                        expect(category).to.have.own.property('subCategories');
                        for(let subCategory of category.subCategories) {
                            expect(subCategory).to.have.own.property('parentCategories');
                        }
                    }
                });
        });

        it('returns all categories in flat structure', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
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
                        expect(category).to.not.have.own.property('subCategories');
                    }
                });
        });

        it('returns a single category', function() {
            const categoryId = MEN_CATEGORY_ID;
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
                .query({
                    id: categoryId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);

                    // Verify structure
                    const category = res.body;
                    requiredFields.verifyCategory(category);
                    expect(category).to.have.own.property('name');
                    expect(category.name).to.equal('Men');
                    expect(category).to.have.own.property('lastModifiedDate');
                    expect(category).to.have.own.property('createdDate');
                });
        });

        it('returns all categories in a tree structure with only root nodes', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
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
                        expect(category).to.not.have.own.property('subCategories');
                    }
                });
        });

        //magento sorting is not working - skip for now.
        it.skip('returns all categories in tree structure sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
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
        it.skip('returns all categories in tree structure with subcategories sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
                .query({
                    type: 'tree',
                    sort: 'name.desc'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyPagedResponse(res.body);

                    // Verify sorting of subcategories
                    for(let category of res.body.results) {
                        requiredFields.verifyCategory(category);
                        const subnames = category.subCategories.map(r => r.name);
                        expect(subnames).to.be.descending;
                    }
                });
        });

        //magento sorting is not working - skip for now.
        it.skip('returns all categories in flat structure sorted by their names', function() {
            return chai.request(env.openwhiskEndpoint)
                .get(env.categoriesPackage + 'getCategories')
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
                .get(env.categoriesPackage + 'getCategories')
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
                .get(env.categoriesPackage + 'getCategories')
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
                .get(`${env.categoriesPackage}getCategories`)
                .query({ limit: -7 })
                .then(function() {
                    chai.assert.fail();
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(err.response).to.be.json;
                    requiredFields.verifyErrorResponse(err.response.body);
                });
        });

        it('returns a 404 error for a non existent category', function () {
            return chai.request(env.openwhiskEndpoint)
                .get(`${env.categoriesPackage}getCategories`)
                .query({ id: '999999999999999' })
                .then(function() {
                    chai.assert.fail();
                })
                .catch(function(err) {
                    expect(err.response).to.have.status(HttpStatus.NOT_FOUND);
                    expect(err.response).to.be.json;
                    requiredFields.verifyErrorResponse(err.response.body);
                });
        });
    });
});