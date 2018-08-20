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

const respondWithServiceError = require('./web-response-utils').respondWithServiceError;
const requestPromise = require('request-promise-native');

/**
 * Base class for magento client. This should be extended for each implemented business domain api like customer, catalog,
 * products or cart.
 */
class MagentoClientBase {

    static const() {
        return {
            CCS_MAGENTO_CUSTOMER_TOKEN: "ccs-magento-customer-token"
        }
    }

    /**
     * Initialise magento client.
     * @param args          parameters as received from open whisk
     * @param mappers       mapper function for magento
     * @param baseEndpoint  the baseEndpoint used to build the client (i.e products)
     */
    constructor(args, mapper, baseEndpoint, errorType) {
        this.baseEndpoint = baseEndpoint ? baseEndpoint : '';
        this.queryString = '';
        this.headers = {
            'accept': 'application/json',
            'content-type': 'application/json; charset=utf-8',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
        };
        this.args = args;
        this.mapper = mapper;
        this.errorType = errorType;
        this.withAuthorizationHeader(this.args.MAGENTO_AUTH_ADMIN_TOKEN);
        this.args.MAGENTO_SCHEMA = args.MAGENTO_SCHEMA || 'http';
        this.args.MAGENTO_API_VERSION = args.MAGENTO_API_VERSION || 'V1';
        this.args.MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME = this.args.MAGENTO_CUSTOMER_TOKEN_EXPIRATION_TIME || '3600';
        this.baseURL = `${this.args.MAGENTO_SCHEMA}://${this.args.MAGENTO_HOST}`;
        this.restApiBaseURL = `${this.baseURL}/rest/${this.args.MAGENTO_API_VERSION}`;
        this.mediaBaseUrl = `${this.baseURL}/${this.args.MAGENTO_MEDIA_PATH}`;
        this.customerToken = this._extractCustomerToken(args.__ow_headers);
    }


    _extractCustomerToken(headers) {
        if (headers && headers['cookie']) {
            let cookies = headers.cookie.split(';');
            for (let i = 0, length = cookies.length; i < length; i++) {
                let parts = cookies[i].trim().split('=');
                if (parts[0].trim() === MagentoClientBase.const().CCS_MAGENTO_CUSTOMER_TOKEN) {
                    if (parts.length > 1) {
                        parts.shift();
                        return parts.join();
                    }
                }
            }
        }

        return null;
    }

    /**
     *  Handles the error received from magento backend. Errors should be propagated to actions were they should be
     *  handled.
     */
    handleError(error) {
        return respondWithServiceError(error, this.args, Promise.resolve.bind(Promise), this.errorType);
    }

    /**
     * @protected
     */
    _handleSuccess(body, headers, statusCode = 200) {
        this.args['response'] = { 'statusCode': statusCode, 'body': body, 'headers': headers };
        return Promise.resolve(this.args);
    }

    /**
     * @protected
     */

    _execute(method, data) {

        let uri = this.restApiBaseURL;
        if (this.baseEndpoint) {
            uri = `${uri}/${this.baseEndpoint}`
        }

        if (this.endpoint) {
            uri = `${uri}/${this.endpoint}`
        }
        if (this.queryString) {
            uri = `${uri}?${this.queryString}`
        }

        //make sure we are sending the customer token when available
        if(this.customerToken) {
            this.withAuthorizationHeader(this.customerToken);
        }
        let options = {
            uri: uri,
            method: method,
            body: data,
            headers: this.headers,
            json: true
        };

        return requestPromise(options);
    }

    /**
     * Override to set the correct endpoint based on customer token.
     * @param id
     * @returns {MagentoCartClient}
     */
    byId(id) {
        //in the customer scenario cart id is obtained based on the customer token
        //the cart id part of endpoint is replaced with mine
        this.args.id = id;
        this.endpoint = (this.customerToken) ? 'mine' : id;
        return this;
    }


    /**
     * Adds the given endpoint to the existing one. The endpoint is usually the uri suffix.
     * Like https://magento.host/cart/<id>/<endpoint>
     */
    withEndpoint(endpoint) {
        this.endpoint = (this.endpoint) ? `${this.endpoint}/${endpoint}` : endpoint;
        return this;
    }
    
    /**
     * Sets the endpoint for the URI. The endpoint is usually the uri suffix.
     * Need it when working with chained actions.
     * TODO - this is need it only for CustomerLogin so check this.
     * Like https://magento.host/cart/<id>/<endpoint>.
     */
    withResetEndpoint(endpoint) {
        this.endpoint = endpoint;
        return this;
    }
    
    /**
     * Sets the query string for the request.
     *
     * @param queryString
     * @return {MagentoRestClientBase}
     */
    withQueryString(queryString) {
        this.queryString = (this.queryString) ? `${this.queryString}&${queryString}` : queryString;
        return this;
    }
    
    /**
     * Adds or overrides the HTTP headers for this request.
     */
    withHeaders(headers) {
        Object.assign(this.headers, headers);
        return this;
    }

    withAuthorizationHeader(value) {
        return this.withHeaders({'authorization': `Bearer ${value}`});
    }

}

module.exports = MagentoClientBase;