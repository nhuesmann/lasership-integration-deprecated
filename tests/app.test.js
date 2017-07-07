const path = require('path');
const chai = require('chai');
const expect = chai.expect;

const rootPath = path.join(__dirname, '../utils');

const {OrderValidator} = require(`${rootPath}/order-validator.js`);
const {parseCSV, archiveCSV, getCSVName} = require(`${rootPath}/csv-helper.js`);
const {LasershipOrder, getDeliveryDate, submitOrder} = require(`${rootPath}/lasership-helper.js`);
const {saveLabel, mergeLabels, archiveLabels} = require(`${rootPath}/label-helper.js`);

const seed = require('./seed/seed.js');

describe('Order Validator', () => {
  it('should approve orders with all required properties present', (done) => {
    let {validOrders, invalidOrders} = new OrderValidator([seed.validOrder]);
    expect(validOrders).to.have.lengthOf(1);
    expect(invalidOrders).to.have.lengthOf(0);
    expect(validOrders[0]).to.equal(seed.validOrder);
    done();
  });

  it('should reject orders missing any required properties', (done) => {
    let {validOrders, invalidOrders} = new OrderValidator([seed.invalidOrder]);
    expect(validOrders).to.have.lengthOf(0);
    expect(invalidOrders).to.have.lengthOf(1);
    expect(invalidOrders[0]).to.equal(seed.invalidOrder);
    expect(invalidOrders[0].ERRORS).to.be.a('string');
    expect(invalidOrders[0].ERRORS).to.equal(`Sales Order ${seed.invalidOrder.SALES_ORDER_}: Missing CONTACT_NAME`);
    done();
  });

  it('should perform further validation on specified properties', (done) => {
    let {validOrders, invalidOrders} = new OrderValidator([seed.orderToValidate]);
    expect(validOrders).to.have.lengthOf(1);
    expect(invalidOrders).to.have.lengthOf(0);
    expect(validOrders[0]).to.include({POSTAL_CODE: '01234'});
    expect(validOrders[0]).to.include({TELEPHONE: '3105311935'});
    expect(validOrders[0]).to.include({TNT: 2});
    done();
  });

  it('should properly route all orders to the correct return arrays', (done) => {
    let {validOrders, invalidOrders} = new OrderValidator([seed.validOrder, seed.invalidOrder, seed.orderToValidate]);
    expect(validOrders).to.have.lengthOf(2);
    expect(invalidOrders).to.have.lengthOf(1);
    done();
  });
});

describe('CSV Helper', () => {

  describe('getCSVName', () => {
    it('should retrieve the correct CSV name', (done) => {
      let name = getCSVName(`${__dirname}/csv-test-directory`);
      expect(name).to.equal('test.csv');
      done();
    });
  });

  describe('parseCSV', () => {
    it('should convert the CSV order to an order object', (done) => {
      let orders = parseCSV(`${__dirname}/csv-test-directory`);
      expect(orders).to.be.an('array');
      expect(orders[0]).to.be.an('object');
      expect(orders[0]).to.deep.equal(seed.matchOrder);
      done();
    });
  });

  describe('archiveCSV', () => {

  });



});
