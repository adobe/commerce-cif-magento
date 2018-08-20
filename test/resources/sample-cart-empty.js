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
    "cart_details": {
        "id": "12345-7",
        "created_at": "2018-06-27 08:47:54",
        "updated_at": "2018-06-27 08:47:54",
        "is_active": true,
        "is_virtual": false,
        "items": [],
        "items_count": 0,
        "items_qty": 0,
        "customer": {
            "email": null,
            "firstname": null,
            "lastname": null
        },
        "billing_address": {
            "id": 515,
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
            "email": null,
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
            "shipping_assignments": []
        }
    },
    "payment_method": null,
    "totals": {
        "grand_total": 0,
        "base_grand_total": 0,
        "subtotal": 0,
        "base_subtotal": 0,
        "discount_amount": 0,
        "base_discount_amount": 0,
        "subtotal_with_discount": 0,
        "base_subtotal_with_discount": 0,
        "shipping_amount": 0,
        "base_shipping_amount": 0,
        "tax_amount": 0,
        "base_tax_amount": 0,
        "weee_tax_applied_amount": null,
        "subtotal_incl_tax": 0,
        "base_currency_code": "USD",
        "quote_currency_code": "USD",
        "items_qty": 0,
        "items": [],
        "total_segments": [
            {
                "code": "subtotal",
                "title": "Subtotal",
                "value": 0
            },
            {
                "code": "shipping",
                "title": "Shipping & Handling",
                "value": 0
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
                "value": 0,
                "area": "footer"
            }
        ]
    },
    "products": {
        "items": [],
        "search_criteria": {
            "filter_groups": [
                {
                    "filters": [
                        {
                            "field": "sku",
                            "value": [],
                            "condition_type": "in"
                        }
                    ]
                }
            ]
        },
        "total_count": 0
    },
    "product_attributes": {
        "items": [
            {
                "is_wysiwyg_enabled": false,
                "is_html_allowed_on_front": false,
                "used_for_sort_by": false,
                "is_filterable": true,
                "is_filterable_in_search": false,
                "is_used_in_grid": true,
                "is_visible_in_grid": false,
                "is_filterable_in_grid": true,
                "position": 0,
                "apply_to": [
                    "simple",
                    "virtual",
                    "configurable"
                ],
                "is_searchable": "1",
                "is_visible_in_advanced_search": "1",
                "is_comparable": "1",
                "is_used_for_promo_rules": "0",
                "is_visible_on_front": "0",
                "used_in_product_listing": "0",
                "is_visible": true,
                "scope": "global",
                "attribute_id": 93,
                "attribute_code": "color",
                "frontend_input": "select",
                "entity_type_id": "4",
                "is_required": false,
                "options": [
                    {
                        "label": " ",
                        "value": ""
                    },
                    {
                        "label": "Black",
                        "value": "36"
                    },
                    {
                        "label": "Yellow",
                        "value": "37"
                    },
                    {
                        "label": "Green",
                        "value": "38"
                    },
                    {
                        "label": "Red",
                        "value": "39"
                    },
                    {
                        "label": "Orange",
                        "value": "40"
                    },
                    {
                        "label": "Blue",
                        "value": "41"
                    },
                    {
                        "label": "Purple",
                        "value": "42"
                    },
                    {
                        "label": "Multi",
                        "value": "43"
                    }
                ],
                "is_user_defined": true,
                "default_frontend_label": "Color",
                "frontend_labels": null,
                "backend_type": "int",
                "source_model": "Magento\\Eav\\Model\\Entity\\Attribute\\Source\\Table",
                "default_value": "",
                "is_unique": "0",
                "validation_rules": []
            },
            {
                "is_wysiwyg_enabled": false,
                "is_html_allowed_on_front": true,
                "used_for_sort_by": false,
                "is_filterable": false,
                "is_filterable_in_search": false,
                "is_used_in_grid": true,
                "is_visible_in_grid": true,
                "is_filterable_in_grid": true,
                "position": 0,
                "apply_to": [],
                "is_searchable": "0",
                "is_visible_in_advanced_search": "0",
                "is_comparable": "0",
                "is_used_for_promo_rules": "0",
                "is_visible_on_front": "0",
                "used_in_product_listing": "0",
                "is_visible": true,
                "scope": "global",
                "attribute_id": 135,
                "attribute_code": "size",
                "frontend_input": "select",
                "entity_type_id": "4",
                "is_required": false,
                "options": [
                    {
                        "label": " ",
                        "value": ""
                    },
                    {
                        "label": "55 cm",
                        "value": "4"
                    },
                    {
                        "label": "L",
                        "value": "5"
                    },
                    {
                        "label": "S",
                        "value": "6"
                    },
                    {
                        "label": "M",
                        "value": "7"
                    },
                    {
                        "label": "XL",
                        "value": "8"
                    },
                    {
                        "label": "XS",
                        "value": "9"
                    },
                    {
                        "label": "XXL",
                        "value": "10"
                    },
                    {
                        "label": "XXS",
                        "value": "11"
                    },
                    {
                        "label": "7",
                        "value": "12"
                    },
                    {
                        "label": "8",
                        "value": "13"
                    },
                    {
                        "label": "9",
                        "value": "14"
                    },
                    {
                        "label": "10",
                        "value": "15"
                    },
                    {
                        "label": "11",
                        "value": "16"
                    },
                    {
                        "label": "12",
                        "value": "17"
                    },
                    {
                        "label": "28",
                        "value": "18"
                    },
                    {
                        "label": "29",
                        "value": "19"
                    },
                    {
                        "label": "30",
                        "value": "20"
                    },
                    {
                        "label": "31",
                        "value": "21"
                    },
                    {
                        "label": "32",
                        "value": "22"
                    },
                    {
                        "label": "34",
                        "value": "23"
                    },
                    {
                        "label": "36",
                        "value": "24"
                    },
                    {
                        "label": "38",
                        "value": "25"
                    },
                    {
                        "label": "40",
                        "value": "26"
                    },
                    {
                        "label": "XXXL",
                        "value": "27"
                    },
                    {
                        "label": "13",
                        "value": "28"
                    },
                    {
                        "label": "XXXS",
                        "value": "29"
                    },
                    {
                        "label": "44",
                        "value": "30"
                    },
                    {
                        "label": "46",
                        "value": "31"
                    },
                    {
                        "label": "42",
                        "value": "32"
                    },
                    {
                        "label": "16",
                        "value": "33"
                    },
                    {
                        "label": "3",
                        "value": "34"
                    },
                    {
                        "label": "6",
                        "value": "35"
                    },
                    {
                        "label": "o",
                        "value": "44"
                    }
                ],
                "is_user_defined": true,
                "default_frontend_label": "Size",
                "frontend_labels": null,
                "backend_type": "int",
                "source_model": "Magento\\Eav\\Model\\Entity\\Attribute\\Source\\Table",
                "default_value": "",
                "is_unique": "0",
                "validation_rules": []
            }
        ],
        "search_criteria": {
            "filter_groups": [
                {
                    "filters": [
                        {
                            "field": "attribute_code",
                            "value": "color",
                            "condition_type": "eq"
                        },
                        {
                            "field": "attribute_code",
                            "value": "size",
                            "condition_type": "eq"
                        }
                    ]
                }
            ]
        },
        "total_count": 2
    }
};