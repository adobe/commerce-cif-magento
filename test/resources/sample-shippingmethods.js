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

module.exports = [
    {
        "carrier_code": "flatrate",
        "method_code": "flatrate",
        "carrier_title": "Flat Rate",
        "method_title": "Fixed",
        "amount": 60,
        "base_amount": 60,
        "available": true,
        "error_message": "",
        "price_excl_tax": 60,
        "price_incl_tax": 60
    },
    {
        "carrier_code": "freeshipping",
        "method_code": "freeshipping",
        "carrier_title": "Free Shipping",
        "method_title": "Free",
        "amount": 0,
        "base_amount": 0,
        "available": true,
        "error_message": "",
        "price_excl_tax": 0,
        "price_incl_tax": 0
    },
    {
        "carrier_code": "ups",
        "method_code": "XPD",
        "carrier_title": "United Parcel Service",
        "method_title": "Worldwide Expedited",
        "amount": 232.98,
        "base_amount": 232.98,
        "available": true,
        "error_message": "",
        "price_excl_tax": 232.98,
        "price_incl_tax": 232.98
    },
    {
        "carrier_code": "ups",
        "method_code": "WXS",
        "carrier_title": "United Parcel Service",
        "method_title": "Worldwide Express Saver",
        "amount": 243.63,
        "base_amount": 243.63,
        "available": true,
        "error_message": "",
        "price_excl_tax": 243.63,
        "price_incl_tax": 243.63
    },
    {
        "carrier_code": "ups",
        "method_code": "XPR",
        "carrier_title": "United Parcel Service",
        "method_title": "Worldwide Express",
        "amount": 246.05,
        "base_amount": 246.05,
        "available": true,
        "error_message": "",
        "price_excl_tax": 246.05,
        "price_incl_tax": 246.05
    },
    {
        "carrier_code": "ups",
        "method_code": "XDM",
        "carrier_title": "United Parcel Service",
        "method_title": "Worldwide Express Plus",
        "amount": 290.05,
        "base_amount": 290.05,
        "available": true,
        "error_message": "",
        "price_excl_tax": 290.05,
        "price_incl_tax": 290.05
    }
];