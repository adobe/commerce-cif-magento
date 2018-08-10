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

const MagentoClientBase = require('@adobe/commerce-cif-magento-common/MagentoClientBase');
const ERROR_TYPE = require('./constants').ERROR_TYPE;

/**
 * Magento cart API implementation.
 */
class MagentoCartClient extends MagentoClientBase {

    /**
     * Builds a cart client for Magento
     *
     * @param args                      parameters as received from open whisk
     * @param cartMapper {Function}     Magento cif cart mapper handler
     * @param paymentMapper             Magento CIF payment mapper instance
     * @param endpoint                  api endpoint
     */
    constructor(args, cartMapper, endpoint) {
        super(args, cartMapper, endpoint, ERROR_TYPE);
        if(this.customerToken) {
            this.baseEndpoint = 'carts';
        } else {
            this.baseEndpoint = 'guest-carts';
        }
    }

    /**
     * Gets a CIF cart by id.
     * This method accepts optional HTTP headers and status code which can be used when returning the cart after
     * a POST and DELETE operation.
     *
     * @param headers optional HTTP response headers
     * @param statusCode optional HTTP status code
     *
     * @return {Promise}   Promise with CCIF cart Object.
     */
    get(headers, statusCode = 200) {
        let queryString = '';
        if (this.args.PRODUCT_ATTRIBUTES) {
            queryString = this.args.PRODUCT_ATTRIBUTES.map((attribute, idx) => {
                return this._mapFilter(idx, 'attribute_code', attribute);
            }).join('&');
        }
        //change the endpoint based on the customer login token
        if(this.customerToken) {
            this.baseEndpoint = 'customer-aggregated-carts';
        } else {
            this.baseEndpoint = 'guest-aggregated-carts';
        }
        return this.withQueryString(queryString)._cartById().then(result => {
            return this._handleSuccess(this.mapper(result, this.args.id, this.mediaBaseUrl, this.args.PRODUCT_ATTRIBUTES), headers, statusCode);
        });
    }

    /**
     * Creates an empty cart and if defined adds a first product to it.
     *
     * @param data {Object}      product data for the new entry
     * @return {Promise}         Promise with cart data
     */
    create() {
        return this._execute('POST').then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Add items to a shopping cart.
     *
     * @param data         The cart item data.
     *
     * @return {Promise}
     */
    addItem(data) {
        return this.withEndpoint('items')._execute('POST', data).then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Add items to a shopping cart.
     *
     * @param data         The cart item data.
     *
     * @return {Promise}
     */
    updateItem(cartEntryId, data) {
        return this.withEndpoint(`items/${cartEntryId}`)._execute('PUT', data).then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Remove item from a shopping cart.
     *
     * @param id the cart identifier
     * @param cartEntryId the cart item identifier
     *
     * @return {Promise}
     */
    deleteItem(cartEntryId) {
        this.withEndpoint(`items/${cartEntryId}`);
        return this._execute('DELETE').then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Add address to shopping cart.
     *
     * @param data         The cart item data.
     *
     * @return {Promise}
     */
    updateBillingAddress(data) {
        return this.withEndpoint('billing-address')._execute('POST', data).then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Add shipping information to shopping cart.
     *
     * @param data         The cart item data.
     *
     * @return {Promise}
     */
    updateShippingInfo(data) {
        this.queryString = '';
        this._setEndpointBasedOnCustomer();
        return this.withEndpoint('shipping-information')._execute('POST', data).then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Add/update a payment of a cart.
     *
     * @param {*} data      The cart payment data.
     */
    updatePayment(data) {
        return this.withEndpoint("selected-payment-method")._execute('PUT', data);
    }

    /**
     * Add a coupon to a shopping cart.
     *
     * @param couponCode      the coupon code
     *
     * @return {Promise}
     */
    addCoupon(couponCode) {
        return this.withEndpoint(`coupons/${couponCode}`)._execute('PUT').then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Delete a coupon from the cart.
     * Magento supports just one coupon per cart which is implicitly deleted.
     *
     * @return {Promise}
     */
    deleteCoupon() {
        return this.withEndpoint('coupons')._execute('DELETE').then(result => {
            return this._handleSuccess(result);
        });
    }

    /**
     * Gets a magento cart by id
     *
     * @return {Request}  Magento response.
     * @protected
     */
    _cartById() {
        return this._execute('GET');
    }

    _mapFilter(idx, field, value) {
        return `productAttributesSearchCriteria[filter_groups][0][filters][${idx}][field]=${field}&productAttributesSearchCriteria[filter_groups][0][filters][${idx}][value]=${value}`;
    }

    _setEndpointBasedOnCustomer() {
        if(this.customerToken) {
            this.baseEndpoint = 'carts';
        } else {
            this.baseEndpoint = 'guest-carts';
        }
    }
}

module.exports = MagentoCartClient;