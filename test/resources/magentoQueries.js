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

const categoryQuery = `{
    products(
    ) {
        items {
          categories {
              jackets        
              shirts        
              pants        
              dress 
          }
      }
    }
  }`

const priceQuery = `{
    products(
    ) {
        items {
          price {
              regularPrice {
                  amount {
                      jackets
                      shirts
                      pants
                      dress
                  }
              }
          }
      }
    }
  }`

const conf_options = `{
    products(
    ) {
        items {
          ... on ConfigurableProduct {
            configurable_options {
              attribute_code
              label
              values {
                value_index
                label
              }
            }
            variants {
              product {
                jackets        
                shirts        
                pants        
                dress        
              }
            }
          }
      }
    }
  }`

const simpleVariants = `{
    products(
    ) {
        items {
          ... on ConfigurableProduct {
            variants {
              product {
                jackets        
                shirts        
                pants        
                dress        
              }
            }
          }
      }
    }
}`

const simpleQuery = `{
    products(
    ) {
        items {
          jackets        
          shirts        
          pants        
          dress        
      }
    }
  }`

const noResultsQuery = `{
    products(
    ) {
        total_count
        page_info {
          page_size
          current_page
        }
    }
  }`

const totalQuery = `{
    products(
    ) {
        total_count
    }
  }`

const countQuery = `{
    products(
    ) {
        total_count
        page_info {
          page_size
          current_page
        }
    }
  }`

const offsetQuery = `{
    products(
    ) {
        page_info {
          page_size
          current_page
        }
    }
  }`

const placesArgsCorrectlyQuery = `{
    products(
        search: "ik hou van honden"
        pageSize: 39
        currentPage: 4
    ) {
    }
  }`

const CIFFields = {
  queryObject: {
    searchProducts: {
      results: {
        prices: {
          country: true
        },
        sku: true,
        id: true,
        variants: {
          available: true
        }
      }
    }
  },
  mockResponse: {
    results: [{
      prices: [{
        country: 'CH',
        amount: 123
      }],
      sku: "sku",
      id: "lol",
      anotherField: "haha",
      obj: {
        wh: "at"
      },
      variants: [{
        sku: "variant",
        guru: 1
      }]
    }]
  }
}

module.exports = { CIFFields, categoryQuery, priceQuery, placesArgsCorrectlyQuery, offsetQuery, countQuery, totalQuery, simpleQuery, noResultsQuery, simpleVariants, conf_options };