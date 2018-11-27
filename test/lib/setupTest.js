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

const mockRequire = require('mock-require');
const sinon = require('sinon');
const utils = require('./utils');
const deepEqual = require('deep-equal');
const assert = require('chai').assert;
const rp = require('request-promise-native');
const rpStub = sinon.stub(rp, 'Request');
mockRequire('request-promise-native', rpStub);
/**
 * function constructor for test context based on mocha described context
 */

module.exports.setup = function (ctx, testDirName, actionName) {

    let action = null;
    let args = null;

    beforeEach(() => {
        args = {
            MAGENTO_HOST: 'does.not.exist',
            MAGENTO_AUTH_ADMIN_TOKEN: 'my-token'
        };
    });

    after(() => {
        rpStub.restore();
    });

    before(() => {
        action = ctx.requireUncached(utils.getPathForAction(testDirName, actionName)).main;
    });

    ctx.prepareResolve = function (mockedResponse, expectedArgs) {
        rpStub.callsFake(args => {
            if (expectedArgs && typeof expectedArgs == 'function') {
                expectedArgs(args);
            } else if (expectedArgs) {
                assert.deepInclude(expectedArgs, args, 'Expected arguments for Magento API call does not' +
                        ' match the actual');
            }
            return Promise.resolve(mockedResponse);
        });
        return ctx;
    };

    ctx.prepareResolveMultipleResponse = function (mockedResponses, expectedArgs) {
        rpStub.callsFake(args => {
            if (expectedArgs) {
                assert.deepInclude(expectedArgs, args, 'Expected arguments for Magento API call does not' +
                                                       ' match the actual');
            }
            for(let i = 0; i < expectedArgs.length; i++) {
                if (deepEqual(args, expectedArgs[i])) {
                    return Promise.resolve(mockedResponses[i]);
                }
            }
        });
        return ctx;
    };
    
    ctx.prepareReject = function (mockedResponse) {
        rpStub.callsFake(() => {
            return Promise.reject(mockedResponse);
        });
        return ctx;
    };

    ctx.execute = function (params) {
        let name;
        for (name in params) {
            if (typeof params[name] !== 'function') {
                args[name] = (args[name]) ? args[name] : params[name];
            }
        }
        return action(args).then(result => {
            return Promise.resolve(result);
        });
    };

    ctx.requireUncached = function (module) {
        delete require.cache[require.resolve(module)];
        return require(module);
    };

    ctx.deleteArgs = function () {
        args = null;
        return ctx;
    };

};
