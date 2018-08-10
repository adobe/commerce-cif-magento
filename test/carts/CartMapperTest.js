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

const assert = require('chai').assert;
const utils = require('../lib/utils');
const config = require('../lib/config').config;
const sampleCart = require('../resources/sample-cart');

describe('Magento CartMapper', () => {

    let mapper = utils.getPathForAction(__dirname, 'CartMapper');
    let cartMapper = require(mapper);
    let magentoMediaBasePath = `http://${config.MAGENTO_HOST}/${config.MAGENTO_MEDIA_PATH}`;
    let formatDate = require(mapper.replace('CartMapper', 'node_modules/@adobe/commerce-cif-magento-common/utils')).formatDate;

    describe('Unit tests', () => {

        let cartData = null;
        let args = {
            id: 'magento-cart-id'
        };

        beforeEach(() => {
            // clone original sample data before each test
            cartData = utils.clone(sampleCart);
            cartData.totals.items.map(itemTotals => {
                itemTotals.sku = cartData.cart_details.items.find(o => {
                    return o.item_id === itemTotals.item_id;
                }).sku;
                return itemTotals;
            });
        });

        it('cart mapper - success', () => {
            //this is cart id as received in the request (i.e open whisk action arguments)
            let mappedCart = cartMapper.mapCart(cartData, args.id, magentoMediaBasePath, config.PRODUCT_ATTRIBUTES);
            let sampleCartDetails = cartData.cart_details;
            let sampleCartTotals = cartData.totals;

            //asserts shipping and billing address
            assertEqualAddress(mappedCart['billingAddress'], sampleCartDetails['billing_address']);
            assert.strictEqual(mappedCart.id, args.id);
            assert.strictEqual(mappedCart.entries.length, sampleCartDetails.items.length);
            assert.strictEqual(mappedCart.currency, sampleCartTotals.quote_currency_code);

            assertPrice(mappedCart.netTotalPrice, sampleCartTotals.grand_total * 100, sampleCartTotals.quote_currency_code);
            assertPrice(mappedCart.grossTotalPrice, sampleCartTotals.base_grand_total * 100, sampleCartTotals.quote_currency_code);
            assertPrice(mappedCart.productTotalPrice, sampleCartTotals.subtotal_incl_tax * 100, sampleCartTotals.quote_currency_code);
            //cart tax is not yet implemented
            assert.isUndefined(mappedCart.taxInfo);

            assert.isDefined(mappedCart.shippingInfo);
            assertPrice(mappedCart.shippingInfo.cost, sampleCartTotals.shipping_incl_tax * 100, sampleCartTotals.quote_currency_code);
            assertPrice(mappedCart.shippingInfo.discountedCost, sampleCartTotals.shipping_incl_tax * 100, sampleCartTotals.quote_currency_code);
            assertTax(mappedCart.shippingInfo.taxInfo, sampleCartTotals.shipping_tax_amount * 100);

            assert.strictEqual(mappedCart.createdAt, formatDate(sampleCartDetails.created_at));
            assert.strictEqual(mappedCart.lastModifiedAt, formatDate(sampleCartDetails.updated_at));

            assert.isDefined(mappedCart.discounts);
            assert.lengthOf(mappedCart.discounts, 1);
            assert.strictEqual(mappedCart.discounts[0].description, sampleCartTotals.total_segments[3].title);
            assertPrice(mappedCart.discounts[0].value, -sampleCartTotals.total_segments[3].value * 100, sampleCartTotals.quote_currency_code);

            assert.isDefined(mappedCart.coupons);
            assert.lengthOf(mappedCart.coupons, 1);
            assert.strictEqual(mappedCart.coupons[0].code, sampleCartTotals.coupon_code);

        });

        it('cart entries mapper - success', () => {

            let sampleCartTotals = cartData.totals;
            let sampleCartDetails = cartData.cart_details;
            let sampleCartProducts = cartData.products;
            let sampleCartAttributes = cartData.product_attributes;

            let mappedCart = cartMapper.mapCart(cartData, args.id, magentoMediaBasePath, config.PRODUCT_ATTRIBUTES);
            let mappedCartEntries = mappedCart.entries;

            assert.isDefined(mappedCartEntries);
            assert.isArray(mappedCartEntries);

            assert.lengthOf(mappedCartEntries, sampleCartDetails.items.length);
            mappedCartEntries.forEach((cartEntry, idx) => {
                assert.containsAllKeys(cartEntry, ['id', 'quantity', 'productVariant']);
                assert.strictEqual(cartEntry.id, sampleCartTotals.items[idx].item_id);
                assert.strictEqual(cartEntry.quantity, sampleCartTotals.items[idx].qty);
                assert.strictEqual(cartEntry.type, 'REGULAR');
                assertPrice(cartEntry.unitPrice, sampleCartTotals.items[idx].price_incl_tax * 100, sampleCartTotals.quote_currency_code);
                assertPrice(cartEntry.price, sampleCartTotals.items[idx].row_total_incl_tax * 100, sampleCartTotals.quote_currency_code);
                assert.strictEqual(cartEntry.productVariant.sku, sampleCartTotals.items[idx].sku);
                assert.isDefined(cartEntry.discounts);
                assert.lengthOf(cartEntry.discounts, 1);
                assertPrice(cartEntry.discounts[0].value, sampleCartTotals.items[idx].discount_amount * 100, sampleCartTotals.quote_currency_code);
            });
            assert.lengthOf(mappedCartEntries, sampleCartDetails.items.length);

            mappedCart.entries.forEach((cartEntry, idx) => {
                //check that the cart partial cart entries are still correctly mapped.
                let sampleCartProduct = sampleCartProducts.items[idx];

                assert.strictEqual(cartEntry.productVariant.sku, sampleCartProduct.sku);
                assert.strictEqual(cartEntry.productVariant.id, sampleCartProduct.sku);
                assert.strictEqual(cartEntry.productVariant.name, sampleCartProduct.name);
                assert.strictEqual(cartEntry.productVariant.description, cartMapper._getCustomAttributeValue(sampleCartProduct.custom_attributes, 'description'));
                cartEntry.productVariant.prices.forEach(price => {
                    assertPrice(price, cartEntry.unitPrice.amount, mappedCart.currency);
                });
                cartEntry.productVariant.assets.forEach(asset => {
                    let sampleImagePath = cartMapper._getCustomAttributeValue(sampleCartProduct.custom_attributes, 'image');
                    assert.strictEqual(asset.id, `${magentoMediaBasePath}${sampleImagePath}`);
                    assert.strictEqual(asset.url, `${magentoMediaBasePath}${sampleImagePath}`);
                });
                cartEntry.productVariant.attributes.forEach(attribute => {
                    let attributeCodeValue = cartMapper._getCustomAttributeValue(sampleCartProduct.custom_attributes, attribute.id);
                    let [name, value] = cartMapper._getNameValueForAttributeCode(attribute.id, attributeCodeValue, sampleCartAttributes);
                    assert.strictEqual(attribute.value, value);
                    assert.strictEqual(attribute.name, name);
                    assert.strictEqual(attribute.isVariantAxis, true);
                });
            });
        });

        it('succeeds when product has one custom attribute', () => {
            //remove color custom attributes
            cartData.products.items[0].custom_attributes = cartData.products.items[0].custom_attributes.filter(attr => {
                return attr.attribute_code !== 'color';
            });
            let mappedCart = cartMapper.mapCart(cartData, args.id, magentoMediaBasePath, config.PRODUCT_ATTRIBUTES);
            assert.strictEqual(mappedCart.entries[0].productVariant.attributes.length, 1);
        });

        it('succeeds in not mapping when prices are 0 ', () => {
            cartData.totals.grand_total = 0;
            cartData.totals.base_grand_total = 0;
            cartData.totals.subtotal_incl_tax = 0;
            cartData.totals.tax_amount = 0;
            cartData.totals.shipping_incl_tax = 0;

            let mappedCart = cartMapper.mapCart(cartData, args.id, magentoMediaBasePath, config.PRODUCT_ATTRIBUTES);

            assert.isUndefined(mappedCart.netTotalPrice);
            assert.isUndefined(mappedCart.grossTotalPrice);
            assert.isUndefined(mappedCart.taxInfo);
            assert.isUndefined(mappedCart.shippingInfo);

            // Required field
            assert.isDefined(mappedCart.productTotalPrice);
        });

        it('succeeds if cart has no billingAddress', () => {
            let cartDataNoBillingAddress = utils.clone(cartData);
            delete cartDataNoBillingAddress.cart_details.billing_address;
            let mappedCart = cartMapper.mapCart(cartDataNoBillingAddress, cartDataNoBillingAddress.totals);
            assert.isUndefined(mappedCart.billingAddress);
        });
    });
});

function assertEqualAddress(mappedCartAddress, magentoCartAddress) {
    assert.strictEqual(mappedCartAddress.id, magentoCartAddress.id);
    assert.strictEqual(mappedCartAddress.title, magentoCartAddress.prefix ? magentoCartAddress.prefix : undefined);
    assert.strictEqual(mappedCartAddress.firstName, magentoCartAddress.firstName ? magentoCartAddress.firstName : undefined);
    assert.strictEqual(mappedCartAddress.lastName, magentoCartAddress.lastName ? magentoCartAddress.lastName : undefined);
    assert.strictEqual(mappedCartAddress.streetName, magentoCartAddress.street[0] ? magentoCartAddress.street[0]: undefined);
    assert.strictEqual(mappedCartAddress.streetNumber, magentoCartAddress.street[1]);
    assert.strictEqual(mappedCartAddress.additionalStreetInfo, magentoCartAddress.street[2]);
    assert.strictEqual(mappedCartAddress.additionalAddressInfo, magentoCartAddress.street[3]);
    assert.strictEqual(mappedCartAddress.postalCode, magentoCartAddress.postcode ? magentoCartAddress.postcode : undefined);
    assert.strictEqual(mappedCartAddress.city, magentoCartAddress.city ? magentoCartAddress.city : undefined);
    assert.strictEqual(mappedCartAddress.region, magentoCartAddress.region ? magentoCartAddress.region : undefined);
    assert.strictEqual(mappedCartAddress.country, magentoCartAddress.country_id ? magentoCartAddress.country_id : undefined);
    assert.strictEqual(mappedCartAddress.organizationName, magentoCartAddress.company ? magentoCartAddress.company : undefined);
    assert.strictEqual(mappedCartAddress.phone, magentoCartAddress.telephone ? magentoCartAddress.telephone : undefined);
    assert.strictEqual(mappedCartAddress.email, magentoCartAddress.email ? magentoCartAddress.email : undefined);
    assert.strictEqual(mappedCartAddress.fax, magentoCartAddress.fax ? magentoCartAddress.fax : undefined);
}

function assertPrice(mappedPrice, sampleAmount, sampleCurrencyCode) {
    assert.isDefined(mappedPrice);
    assert.strictEqual(mappedPrice.amount, sampleAmount);
    assert.strictEqual(mappedPrice.currency, sampleCurrencyCode);
}

function assertTax(mappedTax, sampleAmount) {
    assert.isDefined(mappedTax);
    assert.strictEqual(mappedTax.value, sampleAmount);
}