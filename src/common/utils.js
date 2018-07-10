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

/**
 * Formats a Magento date or date-time String into an RFC3339 / ISO8601 formatted String.
 * 
 * @param {String} date   A Magento date or date-time String, for example like "2018-06-05 10:58:18"
 * 
 * @return {String}       The date formatted in RFC339 / ISO8601 format, for example "2018-06-05T10:58:18.000Z"
 */
function formatDate(date) {
    return new Date(date).toISOString();
}

module.exports.formatDate = formatDate;
