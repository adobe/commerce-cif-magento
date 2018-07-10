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

class MagentoCustomerLogin extends MagentoClientBase {

    /*
     * @param   {string} args.MAGENTO_SCHEMA         Magento schema
     * @param   {string} args.MAGENTO_HOST           Magento host key
     * @param   {string} args.MAGENTO_API_VERSION    Magento api version
     */
    constructor(args, customerMapper) {
        super(args, customerMapper, '', ERROR_TYPE);
    }

    login(data) {
        let postData = {
            username: data.email,
            password: data.password
        };
        let token;

        return this
            .withEndpoint("integration/customer/token")
            ._execute("POST", postData)
            .then((result) => {
                token = result;
                return this
                    .withResetEndpoint("customers/me", 0)
                    .withAuthorizationHeader(token)
                    ._execute("GET")
            })
            .then((result) => {
                let headers = {
                    'Set-Cookie': MagentoClientBase.const().CCS_MAGENTO_CUSTOMER_TOKEN + '=' + token + ';Path=/;Max-Age=' + this.args.MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME
                };
                return this._handleSuccess(this.mapper(result), headers);
            })
            .catch((error) => {
                return this.handleError(error);
            });
    }

}

module.exports = MagentoCustomerLogin;