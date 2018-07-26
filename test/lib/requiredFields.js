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

module.exports = {
    verifyErrorResponse: function(err) {
        expect(err).to.have.own.property("type");
        expect(err).to.have.own.property("reason");
        expect(err).to.have.own.property("message");
    },
    verifyProduct: function(p) {
        expect(p).to.have.own.property("id");
        expect(p).to.have.own.property("name");
        expect(p).to.have.own.property("prices");
        expect(p).to.have.own.property("masterVariantId");
        expect(p).to.have.own.property("variants");
    },
    verifyProductVariant: function(p) {
        expect(p).to.have.own.property("id");
        expect(p).to.have.own.property("name");
        expect(p).to.have.own.property("prices");
        expect(p).to.have.own.property("sku");
        expect(p).to.have.own.property("available");
    }
};