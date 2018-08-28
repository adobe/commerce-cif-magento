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
const assert = chai.assert;

function verifyQueriedFields(o, q){
    assert.isNotArray(o);
    assert.isNotNull(o);
    let count = 0;
    Object.keys(q).forEach(property => {
        if (property !== "args") {
            ++count;
            expect(o).to.have.own.property(property);
            //treat non-null objects
            if (o[property] && typeof o[property] === 'object') {
                if (Array.isArray(o[property]) && o[property].length !== 0) {
                    this.verifyQueriedFields(o[property][0], q[property]);
                } else {
                    this.verifyQueriedFields(o[property], q[property]);
                }
            }
        }
    });
    //expects response to have only queried fields
    expect(Object.keys(o)).to.have.lengthOf(count);
}

module.exports.verifyQueriedFields = verifyQueriedFields;