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
const CommerceServiceForbiddenError = require('@adobe/commerce-cif-common/exception').CommerceServiceForbiddenError;
const CommerceServiceBadRequestError = require('@adobe/commerce-cif-common/exception').CommerceServiceBadRequestError;
const ERROR_TYPE = require('./constants').ERROR_TYPE;
const Customer = require('@adobe/commerce-cif-model').Customer;  // eslint-disable-line no-unused-vars

/**
 * Magento customer API implementation.
 */
class MagentoCustomer extends MagentoClientBase {
    
    /**
     * Builds a customer client for Magento
     *
     * @param args                      parameters as received from open whisk
     * @param customerMapper {Function} magento cif customer mapper handler
     */
    constructor(args, customerMapper) {
        super(args, customerMapper, '', ERROR_TYPE);
        this.id = args.id;
    }

    /**
     * Returns a customer based on the id.
     * TODO Use the id.
     * @param id
     * @return {*}
     */
    getCustomerById() {
        if (!this.customerToken) {
            return this.handleError(new CommerceServiceForbiddenError('The customer token is missing'));
        }
        return this
            .withEndpoint("customers/me")
            .withAuthorizationHeader(this.customerToken)
            ._execute("GET")
            .then(result => {
                if (result.id != this.id) {
                    return this.handleError(new CommerceServiceForbiddenError("The requested customer id doesn't match the provided customer authentication token"));
                }
                return this._handleSuccess(this.mapper(result));
            })
            .catch(error => {
                return this.handleError(error);
            });
    }

    /**
     * Returns a customer based on the customer token extracted by the MagentoClientBase.
     * @return {Customer} The customer data.
     */
    getCustomer() {
        if (!this.customerToken) {
            return this.handleInternalError(new CommerceServiceBadRequestError('The customer token is missing'));          
        }
        return this
            .withEndpoint("customers/me")
            .withAuthorizationHeader(this.customerToken)
            ._execute("GET")
            .then(result => {
                return this._handleSuccess(this.mapper(result));
            })
            .catch(error => {
                return this.handleError(error);
            });
    }
}

module.exports = MagentoCustomer;