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
    "statusCode": 404,
    "message": "404 - {\"message\":\"No such entity with %fieldName = %fieldValue\",\"parameters\":{\"fieldName\":\"id\",\"fieldValue\":333}}",
    "error": {
      "message": "No such entity with %fieldName = %fieldValue",
      "parameters": {
        "fieldName": "id",
        "fieldValue": 333
      }
    },
    "options": {
      "uri": "http://non-existing-domain.com/rest/V1/categories/333",
      "method": "GET",
      "headers": {
        "accept": "application/json",
        "content-type": "application/json; charset=utf-8",
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "authorization": "Bearer k51jy68l9dsy4ny4t21nvbocuiqrw3wf"
      },
      "json": true,
      "simple": true,
      "resolveWithFullResponse": false,
      "transform2xxOnly": false
    },
    "response": {
      "statusCode": 404,
      "body": {
        "message": "No such entity with %fieldName = %fieldValue",
        "parameters": {
          "fieldName": "id",
          "fieldValue": 333
        }
      },
      "headers": {
        "connection": "close",
        "transfer-encoding": "chunked",
        "cache-control": "no-store, no-cache, must-revalidate",
        "content-type": "application/json; charset=utf-8",
        "date": "Mon, 18 Jun 2018 15:41:30 GMT",
        "expires": "Thu, 19 Nov 1981 08:52:00 GMT",
        "pragma": "no-cache",
        "server": "nginx/1.13.12",
        "set-cookie": [
          "PHPSESSID=7dco3vo6naethn62o4k0bi6akc; expires=Mon, 18-Jun-2018 16:41:30 GMT; Max-Age=3600; path=/; domain=magento23.test; HttpOnly"
        ],
        "vary": "Accept-Encoding",
        "x-powered-by": "PHP/7.1.18"
      },
      "request": {
        "uri": {
          "protocol": "http:",
          "slashes": true,
          "auth": null,
          "host": "non-existing-domain.com",
          "port": 80,
          "hostname": "non-existing-domain.com",
          "hash": null,
          "search": null,
          "query": null,
          "pathname": "/rest/V1/categories/333",
          "path": "/rest/V1/categories/333",
          "href": "http://non-existing-domain.com/rest/V1/categories/333"
        },
        "method": "GET",
        "headers": {
          "accept": "application/json",
          "content-type": "application/json; charset=utf-8",
          "pragma": "no-cache",
          "cache-control": "no-cache",
          "authorization": "Bearer k51jy68l9dsy4ny4t21nvbocuiqrw3wf"
        }
      }
    }
  }