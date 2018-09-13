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

module.exports ={
    "cart_details": {
        "id": 4851,
        "created_at": "2018-08-20 12:49:34",
        "updated_at": "2018-08-20 14:33:35",
        "is_active": true,
        "is_virtual": false,
        "items": [
            {
                "item_id": 4577,
                "sku": "eqbisumas-10",
                "qty": 4,
                "name": "Marin Mountain Bike Shoes",
                "price": 110,
                "product_type": "simple",
                "quote_id": "4851"
            }
        ],
        "items_count": 1,
        "items_qty": 4,
        "customer": {
            "id": 7,
            "group_id": 1,
            "default_billing": "0",
            "default_shipping": "0",
            "created_at": "2018-08-20 12:47:03",
            "updated_at": "2018-08-20 12:48:43",
            "created_in": "Default Store View",
            "email": "ricksanc@adobe.com",
            "firstname": "Rick",
            "lastname": "Sanchez",
            "gender": 0,
            "store_id": 1,
            "website_id": 1,
            "addresses": [],
            "disable_auto_group_change": 0,
            "extension_attributes": {
                "is_subscribed": false
            }
        },
        "billing_address": {
            "id": 10589,
            "region": null,
            "region_id": null,
            "region_code": null,
            "country_id": null,
            "street": [
                ""
            ],
            "telephone": null,
            "postcode": null,
            "city": null,
            "firstname": null,
            "lastname": null,
            "customer_id": 7,
            "email": "ricksanc@adobe.com",
            "same_as_billing": 0,
            "save_in_address_book": 0
        },
        "orig_order_id": 0,
        "currency": {
            "global_currency_code": "USD",
            "base_currency_code": "USD",
            "store_currency_code": "USD",
            "quote_currency_code": "USD",
            "store_to_base_rate": 0,
            "store_to_quote_rate": 0,
            "base_to_global_rate": 1,
            "base_to_quote_rate": 1
        },
        "customer_is_guest": false,
        "customer_note_notify": true,
        "customer_tax_class_id": 3,
        "store_id": 1,
        "extension_attributes": {
            "shipping_assignments": [
                {
                    "shipping": {
                        "address": {
                            "id": 6,
                            "firstname": "Cat Eye",
                            "lastname": "Nebulae",
                            "email": "cat.eye@zeus.com",
                            "telephone": "66666666666",
                            "fax": "6666666666",
                            "country_id": "US",
                            "region": "FarAway",
                            "city": "Constellation",
                            "postcode": "666666",
                            "company": "Zeus",
                            "street": [
                                "Draco", "3,262", "Light Years", "Diameter: ~4.5 Light Years, 26,453,814,179,326 Miles"
                            ],
                            "prefix": "Ms Work"
                        },
                        "method": "flatrate_flatrate"
                    },
                    "items": [
                        {
                            "item_id": 4577,
                            "sku": "eqbisumas-10",
                            "qty": 4,
                            "name": "Marin Mountain Bike Shoes",
                            "price": 110,
                            "product_type": "simple",
                            "quote_id": "4851"
                        }
                    ],
                }
            ]
        }
    },
    "payment_method": {
        "method": "checkmo"
    },
    "totals": {
        "grand_total": 1039,
        "base_grand_total": 1039,
        "subtotal": 1039,
        "base_subtotal": 1039,
        "discount_amount": 0,
        "base_discount_amount": 0,
        "subtotal_with_discount": 1039,
        "base_subtotal_with_discount": 1039,
        "shipping_amount": 0,
        "base_shipping_amount": 0,
        "shipping_discount_amount": 5.99,
        "base_shipping_discount_amount": 5.99,
        "tax_amount": 0,
        "base_tax_amount": 0,
        "weee_tax_applied_amount": null,
        "shipping_tax_amount": 0,
        "base_shipping_tax_amount": 0,
        "subtotal_incl_tax": 1039,
        "shipping_incl_tax": 39,
        "base_shipping_incl_tax": 39,
        "base_currency_code": "USD",
        "quote_currency_code": "USD",
        "items_qty": 5,
        "coupon_code": "coupon1",
        "items": [
            {
                "item_id": 4577,
                "price": 110,
                "base_price": 110,
                "qty": 4,
                "row_total": 440,
                "base_row_total": 440,
                "row_total_with_discount": 0,
                "tax_amount": 0,
                "base_tax_amount": 0,
                "tax_percent": 0,
                "discount_amount": 85,
                "base_discount_amount": 85,
                "discount_percent": 0,
                "price_incl_tax": 110,
                "base_price_incl_tax": 110,
                "row_total_incl_tax": 440,
                "base_row_total_incl_tax": 440,
                "options": "[]",
                "weee_tax_applied_amount": null,
                "weee_tax_applied": null,
                "name": "Marin Mountain Bike Shoes"
            }
        ],
        "total_segments": [
            {
                "code": "subtotal",
                "title": "Subtotal",
                "value": 1039
            },
            {
                "code": "giftwrapping",
                "title": "Gift Wrapping",
                "value": null,
                "extension_attributes": {
                    "gw_item_ids": [],
                    "gw_price": "0.0000",
                    "gw_base_price": "0.0000",
                    "gw_items_price": "0.0000",
                    "gw_items_base_price": "0.0000",
                    "gw_card_price": "0.0000",
                    "gw_card_base_price": "0.0000"
                }
            },
            {
                "code": "shipping",
                "title": "Shipping & Handling",
                "value": 0
            },
            {
                "code": "discount",
                "title": "Discount (17 off)",
                "value": -85
            },
            {
                "code": "tax",
                "title": "Tax",
                "value": 0,
                "extension_attributes": {
                    "tax_grandtotal_details": []
                }
            },
            {
                "code": "grand_total",
                "title": "Grand Total",
                "value": 1039,
                "area": "footer"
            },
            {
                "code": "customerbalance",
                "title": "Store Credit",
                "value": 0
            },
            {
                "code": "reward",
                "title": "0 Reward points",
                "value": 0
            }
        ],
        "extension_attributes": {
            "reward_points_balance": 0,
            "reward_currency_amount": 0,
            "base_reward_currency_amount": 0
        }
    },
    "products": {
        "items": [
            {
                "id": 548,
                "sku": "eqbisumas-10",
                "name": "Marin Mountain Bike Shoes",
                "attribute_set_id": 4,
                "price": 110,
                "status": 1,
                "visibility": 1,
                "type_id": "simple",
                "created_at": "2018-07-05 11:43:19",
                "updated_at": "2018-07-05 11:43:19",
                "weight": 5,
                "product_links": [],
                "tier_prices": [],
                "custom_attributes": [
                    {
                        "attribute_code": "meta_title",
                        "value": "Marin Mountain Bike Shoes"
                    },
                    {
                        "attribute_code": "meta_keyword",
                        "value": "Marin Mountain Bike Shoes"
                    },
                    {
                        "attribute_code": "meta_description",
                        "value": "Marin Mountain Bike Shoes <p>Marin mountain bike shoes offer a supportive fit with a supple upper and a stiff, lugged sole to enhance pedal efficiency when grinding uphill and through the dirt.</p>\n<p>Microfiber synthetic leather and nylon mesh uppers gi"
                    },
                    {
                        "attribute_code": "image",
                        "value": "/m/a/marin.jpg"
                    },
                    {
                        "attribute_code": "small_image",
                        "value": "/m/a/marin.jpg"
                    },
                    {
                        "attribute_code": "thumbnail",
                        "value": "/m/a/marin.jpg"
                    },
                    {
                        "attribute_code": "color",
                        "value": "13"
                    },
                    {
                        "attribute_code": "category_ids",
                        "value": [
                            "11"
                        ]
                    },
                    {
                        "attribute_code": "options_container",
                        "value": "container2"
                    },
                    {
                        "attribute_code": "required_options",
                        "value": "0"
                    },
                    {
                        "attribute_code": "has_options",
                        "value": "0"
                    },
                    {
                        "attribute_code": "url_key",
                        "value": "eqbisumas-10"
                    },
                    {
                        "attribute_code": "msrp_display_actual_price_type",
                        "value": "0"
                    },
                    {
                        "attribute_code": "tax_class_id",
                        "value": "2"
                    },
                    {
                        "attribute_code": "is_returnable",
                        "value": "2"
                    },
                    {
                        "attribute_code": "swatch_image",
                        "value": "/m/a/marin.jpg"
                    },
                    {
                        "attribute_code": "size",
                        "value": "34"
                    },
                    {
                        "attribute_code": "summary",
                        "value": "<p>Marin mountain bike shoes offer a supportive fit with a supple upper and a stiff, lugged sole to enhance pedal efficiency when grinding uphill and through the dirt.</p>\n<p>Microfiber synthetic leather and nylon mesh uppers give a glovelike fit with excellent breathability</p>\n<p>Carbon composite road soles offer more rigidity than a nylon sole, providing a direct connection with the pedal, solid power transfer and excellent aerodynamics<br />High traction lugs on outsoles enhance grip and durability in muddy conditions</p>"
                    }
                ]
            }
        ],
        "search_criteria": {
            "filter_groups": [
                {
                    "filters": [
                        {
                            "field": "sku",
                            "value": [
                                "eqwrsnbd",
                                "eqbisumas-10"
                            ],
                            "condition_type": "in"
                        }
                    ]
                }
            ]
        },
        "total_count": 2
    },
    "product_attributes": [
        {
            "code": "color",
            "label": "Color",
            "options": [
                {
                    "value": "",
                    "label": " "
                },
                {
                    "value": "13",
                    "label": "Black"
                },
                {
                    "value": "14",
                    "label": "Yellow"
                },
                {
                    "value": "15",
                    "label": "Green"
                },
                {
                    "value": "16",
                    "label": "Red"
                },
                {
                    "value": "17",
                    "label": "Orange"
                },
                {
                    "value": "18",
                    "label": "Blue"
                },
                {
                    "value": "19",
                    "label": "Purple"
                },
                {
                    "value": "20",
                    "label": "Multi"
                }
            ]
        },
        {
            "code": "size",
            "label": "Size",
            "options": [
                {
                    "value": "",
                    "label": " "
                },
                {
                    "value": "21",
                    "label": "55 cm"
                },
                {
                    "value": "22",
                    "label": "L"
                },
                {
                    "value": "23",
                    "label": "S"
                },
                {
                    "value": "24",
                    "label": "M"
                },
                {
                    "value": "25",
                    "label": "XL"
                },
                {
                    "value": "26",
                    "label": "XS"
                },
                {
                    "value": "27",
                    "label": "XXL"
                },
                {
                    "value": "28",
                    "label": "XXS"
                },
                {
                    "value": "29",
                    "label": "XXXL"
                },
                {
                    "value": "30",
                    "label": "XXXS"
                },
                {
                    "value": "31",
                    "label": "7"
                },
                {
                    "value": "32",
                    "label": "8"
                },
                {
                    "value": "33",
                    "label": "9"
                },
                {
                    "value": "34",
                    "label": "10"
                },
                {
                    "value": "35",
                    "label": "11"
                },
                {
                    "value": "36",
                    "label": "12"
                },
                {
                    "value": "37",
                    "label": "13"
                },
                {
                    "value": "38",
                    "label": "16"
                },
                {
                    "value": "39",
                    "label": "28"
                },
                {
                    "value": "40",
                    "label": "30"
                },
                {
                    "value": "41",
                    "label": "29"
                },
                {
                    "value": "42",
                    "label": "31"
                },
                {
                    "value": "43",
                    "label": "32"
                },
                {
                    "value": "44",
                    "label": "34"
                },
                {
                    "value": "45",
                    "label": "36"
                },
                {
                    "value": "46",
                    "label": "38"
                },
                {
                    "value": "47",
                    "label": "40"
                },
                {
                    "value": "48",
                    "label": "42"
                },
                {
                    "value": "49",
                    "label": "44"
                },
                {
                    "value": "50",
                    "label": "46"
                },
                {
                    "value": "51",
                    "label": "3"
                },
                {
                    "value": "53",
                    "label": "6"
                },
                {
                    "value": "52",
                    "label": "o"
                }
            ]
        }
    ],
    "configurable_parent_relations": []
};