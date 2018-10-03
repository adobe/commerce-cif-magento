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
const expect = chai.expect;
const setup = require('../lib/setupTest').setup;
const config = require('../lib/config').config;

const {
    allFieldsQuery,
    pricesQuery,
    attributesQuery,
    assetsQuery,
    categoriesQuery,
    variantsQuery
} = require('../resources/graphqlQueries');

const {
    magentoAllFieldsQuery,
    magentoPricesQuery,
    magentoAttributesQuery,
    magentoAssetsQuery,
    magentoCategoriesQuery,
    magentoVariantsQuery
} = require('../resources/magentoQueries');

const sampleResponse = require('../resources/sample-graphql-transformed-product-search');

function removeSpaces(s) {
    return s.replace(/\s/g, '');
}

function assertEqualsIgnoreSpaces(query, expectedQuery) {
    expect(removeSpaces(query)).to.equal(removeSpaces(expectedQuery));
}

function test(context, cifQuery, expectedMagentoQuery) {
    return context.prepareResolve(sampleResponse, (expectedArgs) => {
            assertEqualsIgnoreSpaces(expectedArgs.body.query, expectedMagentoQuery);
        })
        .execute(Object.assign({
            'query': cifQuery
        }, config));
}

describe('Unit tests', () => {

    describe('CIF/Magento graphql query transformer', () => {

        setup(this, __dirname, 'graphql');

        it('Correctly transforms a CIF GraphQL request for products', () => {
            test(this, allFieldsQuery, magentoAllFieldsQuery);
        });

        it('Correctly transforms a CIF GraphQL request for prices', () => {
            test(this, pricesQuery, magentoPricesQuery);
        });

        it('Correctly transforms a CIF GraphQL request for attributes', () => {
            test(this, attributesQuery, magentoAttributesQuery);
        });

        it('Correctly transforms a CIF GraphQL request for assets', () => {
            test(this, assetsQuery, magentoAssetsQuery);
        });

        it('Correctly transforms a CIF GraphQL request for categories', () => {
            test(this, categoriesQuery, magentoCategoriesQuery);
        });

        it('Correctly transforms a CIF GraphQL request for variants', () => {
            test(this, variantsQuery, magentoVariantsQuery);
        });
    });

});