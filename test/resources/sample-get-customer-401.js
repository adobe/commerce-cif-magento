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

module.exports = {
    "name": "StatusCodeError",
    "statusCode": 401,
    "message": "401 - {\"message\":\"The consumer isn't authorized to access %resources.\"}",
    "error": {
      "message": "The consumer isn't authorized to access %resources.",
      "parameters": {
        "resources": "self"
      },
      "trace": "removed"
    },
    "options": {
      "uri": "http://magento2.vagrant78/rest/V1/customers/me",
      "method": "GET",
      "headers": {
        "accept": "application/json",
        "content-type": "application/json; charset=utf-8",
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "authorization": "Bearer qwtuyr382svfjt7l5abufyuxqsp4sknvw"
      },
      "json": true,
      "simple": true,
      "resolveWithFullResponse": false,
      "transform2xxOnly": false
    },
    "response": {
      "statusCode": 401,
      "body": {
        "message": "The consumer isn't authorized to access %resources.",
        "parameters": {
          "resources": "self"
        },
        "trace": "removed"
      },
      "headers": {
        "date": "Mon, 25 Jun 2018 12:29:15 GMT",
        "server": "Apache/2.4.7 (Ubuntu)",
        "x-powered-by": "PHP/7.1.17-1+ubuntu14.04.1+deb.sury.org+1",
        "set-cookie": [
          "PHPSESSID=md7mccf92h8518hlaa8d2s90o1; expires=Mon, 25-Jun-2018 13:29:15 GMT; Max-Age=3600; path=/; domain=magento2.vagrant78; HttpOnly"
        ],
        "expires": "Thu, 19 Nov 1981 08:52:00 GMT",
        "cache-control": "no-store, no-cache, must-revalidate",
        "pragma": "no-cache",
        "content-length": "2875",
        "connection": "close",
        "content-type": "application/json; charset=utf-8"
      },
      "request": {
        "uri": {
          "protocol": "http:",
          "slashes": true,
          "auth": null,
          "host": "magento2.vagrant78",
          "port": 80,
          "hostname": "magento2.vagrant78",
          "hash": null,
          "search": null,
          "query": null,
          "pathname": "/rest/V1/customers/me",
          "path": "/rest/V1/customers/me",
          "href": "http://magento2.vagrant78/rest/V1/customers/me"
        },
        "method": "GET",
        "headers": {
          "accept": "application/json",
          "content-type": "application/json; charset=utf-8",
          "pragma": "no-cache",
          "cache-control": "no-cache",
          "authorization": "Bearer qwtuyr382svfjt7l5abufyuxqsp4sknvw"
        }
      }
    }
  }