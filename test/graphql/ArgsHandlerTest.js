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
chai.use(require('chai-string'));
const assert = chai.assert;
const ArgsHandler = require('../../src/graphql/utils/ArgsHandler');
const magentoArgs = require('../../src/graphql/lib/MagentoArguments').magentoArguments;
const obligatoryArgs = require('../../src/graphql/lib/MagentoArguments').obligatoryArguments;

describe('ArgHandler', () => {
    let handler;

    before(() => {
        handler = new ArgsHandler(magentoArgs, obligatoryArgs);
    });

    it('handles arguments as defined andand doesn\t modify the rest', () => {
        let limit = -12;
        let offset = 12;
        let obj = {
            searchProducts: {
                _args: {
                    text: "meskwielt",
                    limit: limit,
                    offset: offset
                }
            }
        }

        let expectedArgs = {
            text: "meskwielt",
            limit: limit,
            offset: offset
        }

        magentoArgs.limit(expectedArgs);
        magentoArgs.offset(expectedArgs);
        magentoArgs.currentPage(expectedArgs);

        handler.handle(obj.searchProducts, 'searchProducts');
        assert.hasAllKeys(obj.searchProducts, '_args');
        assert.hasAllKeys(obj.searchProducts._args, expectedArgs);
        let args = obj.searchProducts._args;
        assert.deepEqual(args, expectedArgs);
    });

    it('handles arguments of entire object', () => {
        let offset = -2;

        let obj = {
            kuku: {
                somethingElse: {
                    _args: {
                        offset: offset
                    }
                },
            }
        }

        let expectedArgs = {
            offset: offset
        }

        magentoArgs.offset(expectedArgs);

        handler.handleWholeObject(obj, '');
        assert.hasAllKeys(obj, 'kuku');
        assert.hasAllKeys(obj.kuku, 'somethingElse');
        assert.hasAllKeys(obj.kuku.somethingElse, '_args');
        let args = obj.kuku.somethingElse._args;
        assert.hasAllKeys(args, expectedArgs);
        assert.deepEqual(args, expectedArgs);
    });

    it('throws error without text of filter', () => {
        let searchProducts = {
            _args: {
                limit: 23,
            }
        }

        assert.throws(function() {handler.handle(searchProducts, 'searchProducts')}, Error);
        
    });
});