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

const chai = require('chai');
const expect = chai.expect;

/**
 * RequiredFields checks the existence of required fields as defined in the API specification.
 */
class RequiredFields {

    verifyErrorResponse(o) {
        expect(o).to.have.own.property("type");
        expect(o).to.have.own.property("reason");
        expect(o).to.have.own.property("message");
    }

    verifyProduct(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("prices");
        expect(o).to.have.own.property("masterVariantId");
        expect(o).to.have.own.property("variants");
        if (!rec) return;

        for (let price of o.prices) {
            this.verifyPrice(price);
        }
        for (let variant of o.variants) {
            this.verifyProductVariant(variant);
        }
    }

    verifyProductVariant(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("prices");
        expect(o).to.have.own.property("sku");
        expect(o).to.have.own.property("available");
        if (!rec) return;
        for (let price of o.prices) {
            this.verifyPrice(price);
        }
    }

    verifyFacet(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("type");
        expect(o).to.have.own.property("values");
        if (!rec) return;
        for (let value of o.values) {
            this.verifyFacetValue(value);
        }
    }

    verifyFacetValue(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("value");
    }

    verifyCustomer(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("email");
        expect(o).to.have.own.property("firstName");
        expect(o).to.have.own.property("lastName");
    }

    verifyLoginResult(o, rec = true) {
        expect(o).to.have.own.property("customer");
        if (!rec) return;
        this.verifyCustomer(o.customer);
    }

    verifyDiscount(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("type");
        expect(o).to.have.own.property("value");
        if (!rec) return;
        this.verifyPrice(o.value);
    }

    verifyInventoryItem(o) {
        expect(o).to.have.own.property("inventoryId");
        expect(o).to.have.own.property("productId");
        expect(o).to.have.own.property("availableQuantity");
    }

    verifyShoppingList(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("entries");
        if (!rec) return;
        for (let entry of o.entries) {
            this.verifyShoppingListEntry(entry);
        }
    }

    verifyShoppingListEntry(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("productVariant");
        expect(o).to.have.own.property("quantity");
        if (!rec) return;
        for (let variant of o.productVariant) {
            this.verifyProductVariant(variant);
        }
    }

    verifyAddressWrapper(o, rec = true) {
        expect(o).to.have.own.property("address");
        if (!rec) return;
        this.verifyAddress(o.address);
    }

    verifyPaymentWrapper(o, rec = true) {
        expect(o).to.have.own.property("payment");
        if (!rec) return;
        this.verifyPayment(o.payment);
    }

    verifyAddress(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("firstName");
        expect(o).to.have.own.property("lastName");
        expect(o).to.have.own.property("country");
        expect(o).to.have.own.property("city");
        expect(o).to.have.own.property("postalCode");
        expect(o).to.have.own.property("streetName");
    }

    verifyAsset(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("url");
    }

    verifyAttribute(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("value");
    }

    verifyPagedResponse(o) {
        expect(o).to.have.own.property("offset");
        expect(o).to.have.own.property("count");
        expect(o).to.have.own.property("total");
        expect(o).to.have.own.property("results");
    }

    verifyPayment(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("method");
    }

    verifyPrice(o) {
        expect(o).to.have.own.property("currency");
        expect(o).to.have.own.property("amount");
    }

    verifyTaxInfo(o) {
        expect(o).to.have.own.property("value");
    }

    verifyTaxPortion(o) {
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("value");
    }

    verifyCategory(o) {
        expect(o).to.have.own.property("id");
    }

    verifyCart(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("entries");
        expect(o).to.have.own.property("productTotalPrice");
        expect(o).to.have.own.property("currency");
        if (!rec) return;
        this.verifyPrice(o.productTotalPrice);
        for (let entry of o.entries) {
            this.verifyCartEntry(entry);
        }
    }

    verifyCartEntry(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("quantity");
        expect(o).to.have.own.property("productVariant");
        expect(o).to.have.own.property("unitPrice");
        expect(o).to.have.own.property("price");
        expect(o).to.have.own.property("type");
        if (!rec) return;
        this.verifyPrice(o.unitPrice);
        this.verifyPrice(o.price);
        this.verifyProductVariant(o.productVariant);
    }

    verifyCoupon(o) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("code");
    }

    verifyOrder(o) {
        expect(o).to.have.own.property("id");
    }

    verifyShippingInfo(o, rec = true) {
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("cost");
        expect(o).to.have.own.property("taxInfo");
        expect(o).to.have.own.property("id");
        if (!rec) return;
        this.verifyPrice(o.cost);
        this.verifyTaxInfo(o.taxInfo);
    }

    verifyShippingMethod(o, rec = true) {
        expect(o).to.have.own.property("id");
        expect(o).to.have.own.property("name");
        expect(o).to.have.own.property("cost");
        if (!rec) return;
        this.verifyPrice(o.cost);
    }

}

module.exports = new RequiredFields();