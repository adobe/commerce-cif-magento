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

const Cart = require('@adobe/commerce-cif-model').Cart;
const CartEntry = require('@adobe/commerce-cif-model').CartEntry;
const CartEntryType = require('@adobe/commerce-cif-common/model').CartEntryType;
const Discount = require('@adobe/commerce-cif-model').Discount;
const ProductVariant = require('@adobe/commerce-cif-model').ProductVariant;
const Price = require('@adobe/commerce-cif-model').Price;
const Asset = require('@adobe/commerce-cif-model').Asset;
const Attribute = require('@adobe/commerce-cif-model').Attribute;
const TaxInfo = require('@adobe/commerce-cif-model').TaxInfo;
const ShippingInfo = require('@adobe/commerce-cif-model').ShippingInfo;
const MagentoAddressHelper = require('./MagentoAddressHelper');
const formatDate = require('@adobe/commerce-cif-magento-common/utils').formatDate;
const PaymentMapper = require('./PaymentMapper');
const Coupon = require('@adobe/commerce-cif-model').Coupon;

/**
 * Utility class to map magento cart objects to CCIF objects. Private marked methods should not be used outside
 * of this class.
 */
class CartMapper {

    /**
     * Maps the Magento cart to the CCIF cart representation.
     *
     * @param magentoCart       JSON containing cart information as returned by Magento.
     * @param id                The cart ID.
     *
     * @returns {Cart}          CCIF Cart representation.
     */
    static mapCart(magentoCart, id, mediaBaseUrl, productAttributes) {
        let paymentMapper = new PaymentMapper();

        //return empty cart since no details are available
        let cart = {};
        if (!magentoCart.cart_details) {
            return cart;
        }

        cart = CartMapper._mapCart(magentoCart, id, mediaBaseUrl, productAttributes);

        if (magentoCart.payment_method) {
            let cifPayment = paymentMapper._mapPayment(magentoCart.payment_method);
            cart = paymentMapper._fillPayment(cifPayment, cart);
        }
        return cart;
    }

    /**
     * @protected
     */
    static _mapCart(magentoCart, id, mediaBaseUrl, productAttributes) {
        let currency = magentoCart.cart_details.currency.quote_currency_code || 'USD';
        let cartEntries = [];
        if (magentoCart.cart_details.items &&
                magentoCart.cart_details.items.length > 0 &&
                magentoCart.totals.items &&
                magentoCart.cart_details.items.length > 0) {
            magentoCart.totals.items.map(itemTotals => {
                itemTotals.sku = magentoCart.cart_details.items.filter(o => {
                    return o.item_id === itemTotals.item_id;
                })[0].sku;
                return itemTotals;
            });
            cartEntries = CartMapper._mapCartEntries(magentoCart, currency, mediaBaseUrl, productAttributes);
        }

        let productTotalPrice = new Price.Builder()
            .withAmount(0)
            .withCurrency(currency)
            .build();
        if (magentoCart.totals && Math.abs(magentoCart.totals.subtotal_incl_tax) > 0) {
            productTotalPrice = new Price.Builder()
                .withAmount(magentoCart.totals.subtotal_incl_tax * 100)
                .withCurrency(currency)
                .build();
        }

        let cart = new Cart.Builder()
            .withCurrency(currency)
            .withEntries(cartEntries)
            .withId(id)
            .withProductTotalPrice(productTotalPrice)
            .build();
        cart.lastModifiedDate = formatDate(magentoCart.cart_details.updated_at);
        cart.createdDate = formatDate(magentoCart.cart_details.created_at);

        if (magentoCart.totals) {
            cart.currency = magentoCart.totals.quote_currency_code;
            cart.taxIncludedInPrices = true;
            //do not map when 0
            if (Math.abs(magentoCart.totals.grand_total) > 0) {
                cart.netTotalPrice = new Price.Builder()
                    .withAmount(magentoCart.totals.grand_total * 100)
                    .withCurrency(currency)
                    .build();
            }
            //do not map when 0
            if (Math.abs(magentoCart.totals.base_grand_total) > 0) {
                cart.grossTotalPrice = new Price.Builder()
                    .withAmount(magentoCart.totals.base_grand_total * 100)
                    .withCurrency(currency)
                    .build();
            }

            //do not map when 0
            if (Math.abs(magentoCart.totals.tax_amount) > 0) {
                cart.taxInfo = new TaxInfo.Builder()
                    .withAmount(magentoCart.totals.tax_amount * 100).build();
            }
            let totalSegments = magentoCart.totals.total_segments;
            if (totalSegments) {
                cart.discounts = totalSegments.filter(s => s.code === 'discount').map(d => {
                    return CartMapper._mapCartDiscount(d, magentoCart.totals.quote_currency_code);
                });
            }
            let couponCode = magentoCart.totals.coupon_code;
            if (couponCode) {
                cart.coupons = [CartMapper._mapCoupon(couponCode)];
            }
        }

        if (magentoCart.cart_details.billing_address) {
            cart.billingAddress = MagentoAddressHelper.mapToCIFAddress(magentoCart.cart_details.billing_address);
        }

        if (magentoCart.cart_details.extension_attributes && magentoCart.cart_details.extension_attributes.shipping_assignments instanceof Array) {
            // Magento supports splitting the order into multipe shipping locations and methods, right now CIF supports only one.
            let magentoShippingAddresses = magentoCart.cart_details.extension_attributes.shipping_assignments;
            if (magentoShippingAddresses.length > 0) {
                cart.shippingAddress = MagentoAddressHelper.mapToCIFAddress(magentoShippingAddresses[0].shipping.address);
                //do not map shipping info if the price is 0
                if (Math.abs(magentoCart.totals.shipping_incl_tax) > 0) {
                    cart.shippingInfo = CartMapper._mapShippingInfo(magentoShippingAddresses[0].shipping, magentoCart.totals);
                }
            }
        }

        return cart;
    }

    /**
     * @private
     */
    static _mapCartDiscount(magentoDiscount, currency) {
        //ensure discount value is always positive since Magento sets negative value here
        const discountValue = Math.abs(magentoDiscount.value);
        const price = new Price.Builder()
            .withAmount(discountValue * 100)
            .withCurrency(currency)
            .build();
        const discount = new Discount.Builder()
            .withAmount(price)
            .withId("discount")
            .withType("discount")
            .build();
        discount.message = magentoDiscount.title;
        return discount;
    }

    /**
     * @private
     */
    static _mapCoupon(couponCode) {
        return new Coupon.Builder().withId(couponCode).withCode(couponCode).build();
    }

    /**
     * @private
     */
    static _mapShippingInfo(magentoShippingInfo, magentoCartTotals) {
        let shippingPrice = new Price.Builder()
            .withAmount(magentoCartTotals.shipping_incl_tax * 100)
            .withCurrency(magentoCartTotals.quote_currency_code)
            .build();
        let taxInfo = new TaxInfo.Builder().withAmount(magentoCartTotals.shipping_tax_amount * 100).build();
        let shippingInfo = new ShippingInfo.Builder()
            .withId(magentoShippingInfo.method)
            .withName(magentoShippingInfo.method)
            .withPrice(shippingPrice)
            .withTaxInfo(taxInfo)
            .build();
        shippingInfo.discountedPrice = new Price.Builder()
            .withAmount(magentoCartTotals.shipping_incl_tax * 100)
            .withCurrency(magentoCartTotals.quote_currency_code)
            .build();

        return shippingInfo;
    }

    /**
     * @private
     */
    static _mapCartEntries(magentoCart, currency, mediaBaseUrl, productAttributes) {
        let itemsTotals = magentoCart.totals.items;
        return itemsTotals.map(itemTotal => {
            const productItem = magentoCart.products.items.find(item => {
                return itemTotal.sku === item.sku;
            });
            const price = new Price.Builder()
                .withAmount(itemTotal.row_total_incl_tax * 100)
                .withCurrency(currency)
                .build();
            const unitPrice = new Price.Builder()
                .withAmount(itemTotal.price_incl_tax * 100)
                .withCurrency(currency)
                .build();
            const productVariant = CartMapper._mapProductVariant(
                unitPrice, productItem, magentoCart.product_attributes, mediaBaseUrl, productAttributes);
            const cartEntry = new CartEntry.Builder()
                .withId(itemTotal.item_id)
                .withPrice(price)
                .withProductVariant(productVariant)
                .withQuantity(itemTotal.qty)
                .withType(CartEntryType.REGULAR)
                .withUnitPrice(unitPrice)
                .build();
            if (itemTotal.discount_amount && itemTotal.discount_amount > 0) {
                const discount = CartMapper._mapCartEntryDiscount(itemTotal.discount_amount, currency);
                cartEntry.discounts = [discount];
            }
            return cartEntry;
        });
    }

    /**
     * @private
     */
    static _mapCartEntryDiscount(discount_amount, currency) {
        const price = new Price.Builder()
            .withAmount(discount_amount * 100)
            .withCurrency(currency)
            .build();
        return new Discount.Builder()
            .withAmount(price)
            .withId("discount")
            .withType("discount")
            .build();
    }

    /**
     * @private
     */
    static _mapProductVariant(price, item, magentoAttributes, mediaBaseUrl, productAttributes) {

        let productVariant = new ProductVariant.Builder()
            .withAvailable(true) // TODO: Get actual value from backend
            .withId(item.sku)
            .withName(item.name)
            .withPrices([price])
            .withSku(item.sku)
            .build();

        let desc = CartMapper._getCustomAttributeValue(item.custom_attributes, 'description');
        if (desc) {
            productVariant.description = desc;
        }
        let img = CartMapper._getCustomAttributeValue(item.custom_attributes, 'image');
        if (img) {
            productVariant.assets = [];
            let asset = CartMapper._mapImage(img, mediaBaseUrl);
            productVariant.assets.push(asset);
        }

        if (productAttributes) {
            productVariant.attributes =
                productAttributes.map(attributeCode => {
                    let attributeCodeValue = CartMapper._getCustomAttributeValue(item.custom_attributes, attributeCode);
                    if (attributeCodeValue) {
                        let [name, value] = CartMapper._getNameValueForAttributeCode(attributeCode, attributeCodeValue, magentoAttributes);
                        let customAttribute = new Attribute.Builder()
                            .withId(attributeCode)
                            .withName(name)
                            .withValue(value)
                            .build();
                        customAttribute.variantAttribute = true;
                        return customAttribute;
                    }
                    return null;
                }).filter(result => {
                    return result != null;
                });
        }

        return productVariant;
    }

    /**
     * @private
     */
    static _getNameValueForAttributeCode(attributeCode, attributeCodeValue, magentoAttributes) {
        // first find the attributes based on the attribute code (i.e. color)
        let attr = magentoAttributes.items.find(attr => {
            return attr.attribute_code === attributeCode;
        });

        // second find the attribute value label
        let label = attr.options.find(attr => {
            return attr.value === attributeCodeValue;
        }).label;

        return [attr.default_frontend_label, label];
    }

    /**
     * @private
     */
    static _mapImage(image, mediaPath) {
        let url = `${mediaPath}${image}`;
        return new Asset.Builder()
            .withId(url)
            .withUrl(url)
            .build();
    }

    /**
     * @private
     */
    static _getCustomAttributeValue(customAttributes, attributeName) {
        let attr = customAttributes.find(attr => {
            return attr.attribute_code === attributeName;
        });
        return attr ? attr.value : null;
    }
}

module.exports = CartMapper;