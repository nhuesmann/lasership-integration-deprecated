const validOrder = {
  SALES_ORDER_: '123456',
  CONTACT_NAME: 'Nathan Huesmann',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '3105311935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '6/9/13',
  REFERENCE: 'PC FAM EAST',
  TNT: 2,
  CARRIER: 'LaserShip'
};

const invalidOrder = {
  SALES_ORDER_: '123987',
  CONTACT_NAME: '',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '3105311935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '6/9/13',
  REFERENCE: 'PC FAM EAST',
  TNT: 2,
  CARRIER: 'LaserShip'
};

const orderToValidate = {
  SALES_ORDER_: '123987',
  CONTACT_NAME: 'Nathan Huesmann',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '1234',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '(310) 531-1935',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'Ship it ship it ship it.',
  SHIP_DATE: '6/9/13',
  REFERENCE: 'PC FAM EAST',
  TNT: '2',
  CARRIER: 'LaserShip'
};

const matchOrder = {
  SALES_ORDER_: '123456',
  CONTACT_NAME: 'Dr. Steven Brule',
  COMPANY_NAME: '',
  ADDRESS_1: '291 Coral Circle',
  ADDRESS_2: '',
  POSTAL_CODE: '90245',
  CITY: 'El Segundo',
  STATE: 'CA',
  COUNTRY: 'US',
  TELEPHONE: '5551234567',
  RESIDENTIAL_COMMERCIAL: 'YES',
  SHIPPING_METHOD: '90',
  BILL_TRANSPORTATION_TO: '1',
  PACKAGE_TYPE: '1',
  WEIGHT: '10',
  SPECIAL_DELIVERY_INSTRUCTIONS: 'check it out',
  SHIP_DATE: '7/7/17',
  REFERENCE: 'FOR YOUR HEALTH',
  TNT: '1',
  CARRIER: 'LaserShip'
};

module.exports = {
  validOrder,
  invalidOrder,
  orderToValidate,
  matchOrder
}
