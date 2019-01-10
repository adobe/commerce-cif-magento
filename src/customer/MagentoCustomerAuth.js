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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

class MagentoCustomerAuth extends MagentoClientBase {

    constructor(args) {
        super(args, null, '', ERROR_TYPE);
    }

    auth(email, password) {
        let postData = {
            username: email,
            password: password
        };
        return this._customerToken(postData)
            .then(token => {
                return this._handleSuccess({
                    access_token: token,
                    token_type: 'bearer'
                });
            })
            .catch((error) => {
                return this.handleError(error);
            });
    }

    _customerToken(postData) {
        return this
            .withEndpoint("integration/customer/token")
            ._execute("POST", postData)
    }
}

module.exports = MagentoCustomerAuth;