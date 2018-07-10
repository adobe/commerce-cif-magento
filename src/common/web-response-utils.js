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

"use strict";

const HttpStatusCodes = require('http-status-codes');
const CommerceServiceResourceNotFoundError = require('@adobe/commerce-cif-common/exception').CommerceServiceResourceNotFoundError;
const CommerceServiceBadRequestError = require('@adobe/commerce-cif-common/exception').CommerceServiceBadRequestError;
const CommerceServiceForbiddenError = require('@adobe/commerce-cif-common/exception').CommerceServiceForbiddenError;
const CommerceServiceUnauthorizedError = require('@adobe/commerce-cif-common/exception').CommerceServiceUnauthorizedError;
const UnexpectedError = require('@adobe/commerce-cif-common/exception').UnexpectedError;
const NotImplementedError = require('@adobe/commerce-cif-common/exception').NotImplementedError;

function respondWithServiceError(error, args, resolve, errorType) {
    let internalError;
    if (error && Object.getPrototypeOf(error.constructor).name === 'BaseCcifError') { // workaround because 'instanceof BaseCcifError' fails!
        internalError = error;
    } else if (error && error.statusCode === HttpStatusCodes.NOT_FOUND) {
        internalError = new CommerceServiceResourceNotFoundError('Magento resource not found', error);
    } else if (error && error.statusCode === HttpStatusCodes.BAD_REQUEST) {
        internalError = new CommerceServiceBadRequestError('Bad Magento Request', error);
    } else if (error && error.statusCode === HttpStatusCodes.FORBIDDEN) {
        internalError = new CommerceServiceForbiddenError('Forbidden Request', error);
    } else if (error && error.statusCode === HttpStatusCodes.NOT_IMPLEMENTED) {
        internalError = new NotImplementedError('Not implemented', error);
    } else if (error && error.statusCode === HttpStatusCodes.UNAUTHORIZED) {
        internalError = new CommerceServiceUnauthorizedError('Unauthorized Request', error);
    } else {
        internalError = new UnexpectedError('Unknown error while communicating with Magento', error);
    }

    args['response'] = {
        'error': internalError,
        'errorType': errorType
    };
    return resolve(args);
}

module.exports.respondWithServiceError = respondWithServiceError;
