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

/**
 * This file defines how to handle cif graphql arguments and translate them into magento graphql arguments.
 * The 'args' object takes the cif argument names as properties with the corresponding handler functions as values.
 * The 'obligatoryArgs' object includes the fields on which you want to enforce some argument treatments as properties
 * and an array with the names of the argument handler functions (as defined in 'args' object) which are to be executed
 * in order if not present in the field's argument object as corresponding values.
 */

const GraphQLError = require('graphql/error').GraphQLError;

let args = {
    limit: function (args) {
        let defaultLimit = 25;
        let limit = Number(args.limit);
        if (!limit || limit < 0) {
            limit = defaultLimit;
        }
        args.limit = limit;
    },
    offset: function(args) {
        let defaultOffset = 0;
        let offset = Number(args.offset);
        if (!offset || offset < 0) {
            offset = defaultOffset;
        }
        args.offset = offset;
    },
    currentPage: function(args) {
        let currentPage = 1;
        if (args.limit > 0 && args.offset % args.limit === 0) {
            currentPage = (args.offset / args.limit) + 1;
        }
        args.currentPage = currentPage;
    },
    textOrFilter: function (args) {
        let text = args.text;
        let filter = args.filter;
        if (!(text || filter) || (filter && filter.length === 0)) {
            throw new GraphQLError("The request didn't include any valid search filter or text argument");
        }
    }
};

let obligatoryArgs = {
    searchProducts: ['textOrFilter', 'limit', 'offset', 'currentPage']
};

module.exports.magentoArguments = args;
module.exports.obligatoryArguments = obligatoryArgs;