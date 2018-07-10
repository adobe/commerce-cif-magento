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

const object = require('lodash/object');
const Address = require('@adobe/commerce-cif-model').Address;

/**
 * Helper class for posting and deleting a cart shipping or billing address.
 */
class MagentoAddressHelper {

    /**
     * Maps a CIF address object to Magento address object
     *
     * @param cifAddress {Address}          the CIF address object
     * @return {newAddress}                 Magento mapped address object
     **/
    static mapToMagentoAddress(cifAddress) {
        let newAddress = object.omit(
            object.mapKeys(cifAddress, function (value, key) {
                switch (key) {
                    case 'postalCode':
                        return 'postcode';

                    case 'phone':
                        return 'telephone';

                    case 'organizationName':
                        return 'company';

                    case 'country':
                        return 'country_id';

                    default:
                        return key.toLowerCase();
                }
            }), 'title', 'salutation', 'streetname', 'streetnumber', 'additionaladdressinfo', 'additionalstreetinfo');

        // construct Magento street array, by convention street name comes first, then number and other items
        let street = [];
        if (cifAddress.streetName) {
            street.push(cifAddress.streetName);
        }
        if (cifAddress.streetNumber) {
            street.push(cifAddress.streetNumber);
        }
        if (cifAddress.additionalStreetInfo) {
            street.push(cifAddress.additionalStreetInfo);
        }
        if (cifAddress.additionalAddressInfo) {
            street.push(cifAddress.additionalAddressInfo);
        }
        if (street.length > 0) {
            newAddress.street = street;    
        }
        // construct prefix field
        newAddress.prefix = [cifAddress.salutation, cifAddress.title].join(' ').trim();

        return object.pickBy(newAddress);
    }

    /**
    * Maps a Magento address object to CIF address object
    * 
    * @param magentoAddress    The Magento address object
    * @return {Address}        CIF mapped address object
    */
    static mapToCIFAddress(magentoAddress) {
        const address = new Address();
        address.id = magentoAddress.id;
        address.firstName = magentoAddress.firstname;
        address.lastName = magentoAddress.lastname;
        address.title = magentoAddress.prefix;
        if (Array.isArray(magentoAddress.street)) {
            if (magentoAddress.street[0]) {
                address.streetName = magentoAddress.street[0];
            }
            if (magentoAddress.street[1]) {
                address.streetNumber = magentoAddress.street[1];
            }
            if (magentoAddress.street[2]) {
                address.additionalStreetInfo = magentoAddress.street[2];
            }
            if (magentoAddress.street[3]) {
                address.additionalAddressInfo = magentoAddress.street[3];
            }
        }
        address.postalCode = magentoAddress.postcode;
        address.city = magentoAddress.city;
        address.region = magentoAddress.region;
        address.country = magentoAddress.country_id;
        address.organizationName = magentoAddress.company;
        address.phone = magentoAddress.telephone;
        address.email = magentoAddress.email;
        address.fax = magentoAddress.fax;
        return object.pickBy(address);
    }
}

module.exports = MagentoAddressHelper;