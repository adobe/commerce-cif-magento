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
const sinon = require('sinon');
const setup = require('../lib/setupTest').setup;

const MagentoClientBase = require('../../src/common/MagentoClientBase');

describe('Magento Common MagentoClientBase', () => {

    describe('Unit tests', () => {

        // Add helpers to context
        setup(this, __dirname, 'MagentoClientBase');

        let args = {
            DEBUG: 1
        };

        it('returns the activation id in debug mode', () => {
            let id = 'testId';
            process.env.__OW_ACTIVATION_ID = id;

            let clientBase = new MagentoClientBase(args);

            return clientBase._handleSuccess("", {}).then((res) => {
                assert.isDefined(res.response.headers);
                assert.isDefined(res.response.headers['OW-Activation-Id']);
                assert.equal(res.response.headers['OW-Activation-Id'], id);
            });
        });

        it('profiles a successful request', () => {
            let sampleOutput = 'sampleOutput';
            let clientBase = new MagentoClientBase(args);
            let spy = sinon.spy(clientBase, '_logRequest');
            this.prepareResolve(sampleOutput);

            return clientBase._profileRequest({}).then((res) => {
                assert.equal(res, sampleOutput);
                assert.isTrue(spy.calledOnce);
            });
        });

        it('profiles a failing request', () => {
            let sampleOutput = 'sampleOutput';
            let clientBase = new MagentoClientBase(args);
            let spy = sinon.spy(clientBase, '_logRequest');
            this.prepareReject(sampleOutput);

            return clientBase._profileRequest({})
                .then(() => {
                    assert.fail();
                })
                .catch((res) => {
                    assert.equal(res, sampleOutput);
                    assert.isTrue(spy.calledOnce);
                });
        });

        it('profiles requests only in debug mode', () => {
            let clientBase = new MagentoClientBase(args);
            let sampleOutput = 'sampleOutput';
            this.prepareResolve(sampleOutput);

            let spy = sinon.spy(clientBase, '_profileRequest');

            return clientBase._execute().then((res) => {
                assert.equal(res, sampleOutput);
                assert.isTrue(spy.calledOnce);
            });
        });

        it('does not profile requests if not in debug mode', () => {
            let clientBase = new MagentoClientBase({});
            let sampleOutput = 'sampleOutput';
            this.prepareResolve(sampleOutput);

            let spy = sinon.spy(clientBase, '_profileRequest');

            return clientBase._execute().then((res) => {
                assert.equal(res, sampleOutput);
                assert.isTrue(spy.notCalled);
            });
        });

    });
});