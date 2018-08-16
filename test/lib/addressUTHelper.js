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

const assert = require('chai').assert;

/**
 * @param ctx           context initialized by action describe
 * @return that         an object that encapsulates test functions for both post and delete http operations.
 */
module.exports.tests = function (ctx) {

    let that = {};

    /**
     * Verifies that the correct error is returned when the cart id is not provided. Used from post/delete unit tests.
     */
    that.missingCartId = function () {
        return ctx.execute()
            .then(result => {
                assert.isDefined(result.response);
                assert.isDefined(result.response.error);
                assert.strictEqual(result.response.error.message, 'Parameter \'id\' is missing.');
            });
    };

    /**
     * Verifies that the correct error is returned when the address field is empty. Used from post/delete unit tests.
     */
    that.emptyAddress = function () {
        return ctx.execute({
            'id': '12345-1',
            'address': {},
            'default_method': 'default_method',
            'default_carrier': 'default_carrier'
        }).then(result => {
            assert.isDefined(result.response);
            assert.isDefined(result.response.error);
            assert.strictEqual(result.response.error.name, 'MissingPropertyError');
        });
    };

    /**
     * Verifies that the correct error is returned when the no address format is wrong.
     */
    that.wrongAddress = function () {
        return ctx.prepareResolve().execute({ 'id': '12345-1' })
            .then(result => {
                assert.isDefined(result.response);
                assert.isDefined(result.response.error);
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
            });
    };

    that.testCIFAddress = function () {
        const addr = {
            id: 6,
            title: 'Work',
            salutation: 'Ms',
            firstName: 'Cat Eye',
            lastName: 'Nebulae',
            streetName: 'Draco',
            streetNumber: '3,262',
            additionalStreetInfo: 'Light Years',
            postalCode: '666666',
            city: 'Constellation',
            region: 'FarAway',
            country: 'US',
            organizationName: 'Zeus',
            phone: '66666666666',
            email: 'cat.eye@zeus.com',
            fax: '6666666666',
            additionalAddressInfo: 'Diameter: ~4.5 Light Years, 26,453,814,179,326 Miles'
        };
        return addr;
    }

    that.testMagentoAddress = function () {
        const addr = {
            "id": 6,
            "firstname": "Cat Eye",
            "lastname": "Nebulae",
            "email": "cat.eye@zeus.com",
            "telephone": "66666666666",
            "country_id": "US",
            "region": "FarAway",
            "city": "Constellation",
            "postcode": "666666",
            "company": "Zeus",
            'fax': '6666666666',
            "street": [
                "Draco", "3,262", "Light Years", "Diameter: ~4.5 Light Years, 26,453,814,179,326 Miles"
            ],
            "prefix": "Ms Work"
        };
        return addr;
    }

    return that;
};
