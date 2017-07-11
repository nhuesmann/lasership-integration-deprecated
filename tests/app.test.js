require('../config/config.js');

// TODO: test error catching in csv parser / archiver?

const path = require('path');
const chai = require('chai');
const expect = chai.expect;

const rootPath = path.join(__dirname, '../utils');

const {OrderValidator} = require(`${rootPath}/order-validator.js`);
const {parseCSV, archiveCSV, getCSVName} = require(`${rootPath}/csv-helper.js`);
const {LasershipOrder, getDeliveryDate, submitOrder} = require(`${rootPath}/lasership-helper.js`);
const {saveLabel, mergeLabels, archiveLabels} = require(`${rootPath}/label-helper.js`);

const seed = require('./seed/seed.js');
const now = Math.floor(new Date() / 1000);
const csvDir = `${__dirname}/test-drop-csv-here`;

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

  before(seed.prepCSV);

  describe('#getCSVName()', () => {
    it('should retrieve the correct CSV name', (done) => {
      let name = getCSVName(csvDir);
      expect(name).to.equal('test.csv');
      done();
    });
  });

  describe('#parseCSV()', () => {
    it('should convert the CSV order to an order object', (done) => {
      let orders = parseCSV(csvDir);
      expect(orders).to.be.an('array');
      expect(orders[0]).to.be.an('object');
      expect(orders[0]).to.deep.equal(seed.matchOrder);
      done();
    });
  });

  describe('#archiveCSV()', () => {
    it('should move the CSV from the drop directory to an archive folder', (done) => {
      archiveCSV(now, csvDir, __dirname).then(archived => {
        let postCSVName = getCSVName(csvDir);
        expect(postCSVName).to.be.undefined;
        let archivedCSVName = getCSVName(`${__dirname}/archive/${now}`);
        expect(archivedCSVName).to.equal('test.csv');
        done();
      });
    });
  });
});

describe('LaserShip Helper', () => {

  describe('#getDeliveryDate()', () => {
    it('should return a valid delivery date adjusted for destination timezone', (done) => {
      getDeliveryDate(seed.validOrder).then(timestamp => {
        expect(timestamp).to.be.a('string');
        expect(timestamp).to.equal('2017-07-10T04:00:00Z');
        done();
      });
    });

    it('should return an error if the address is not found', (done) => {
      let order = seed.invalidOrder;
      getDeliveryDate(order).then(() => {
        // Should not evaluate
      }).catch(e => {
        expect(e.toString()).to.equal(`Error: Address not found: ${order.ADDRESS_1} , ${order.CITY}, ${order.STATE} ${order.POSTAL_CODE}`);
        done();
      });
    });
  });

  describe('#LasershipOrder()', () => {
    it('should create an object with all required fields', (done) => {
      let lsOrder = new LasershipOrder(seed.forLsOrderConstructor);
      expect(lsOrder).to.not.equal(seed.forLsOrderConstructor);
      expect(lsOrder).to.be.an('object');
      expect(lsOrder).to.have.all.keys(Object.keys(seed.validLsOrder));
      done();
    });
  });

  describe('#submitOrder()', () => {
    it('should return a valid response for a valid order', (done) => {
      let submitRequest = submitOrder(seed.validLsOrder);
      submitRequest.then((response) => {
        try {
          var res = JSON.parse(response);
        }
        catch(e) {
          done(e);
        }
        expect(res.Error).to.be.false;
        expect(res.Order.CustomerOrderNumber).to.equal(seed.validLsOrder.CustomerOrderNumber);
        expect(res.Order).to.have.property('Label');
        expect(res.Order.Label).to.be.a('string');
        done();
      }).catch(e => {
        // Should not evaluate
        console.log(e);
      });
    });

    it('should return an error message for an invalid order', (done) => {
      let submitRequest = submitOrder(seed.invalidLsOrder);
      submitRequest.then((response) => {
        // Should not evaluate
      }).catch(e => {
        expect(e.statusCode).to.equal(400);
        expect(e).to.have.property('error');
        try {
          let errObj = JSON.parse(e.error);
          expect(errObj.ErrorMessage).to.equal('Destination-Contact');
          done();
        }
        catch(parseErr) {
          done(parseErr);
        }
      });
    });
  });
});

describe('Label Helper', () => {

  // describe('#saveLabel()', () => {
  //   it('should do something', () => {
  //
  //   });
  // });

  // describe('#mergeLabels()', () => {
  //   it('should do something elese', () => {
  //
  //   });
  // });

  // describe('#archiveLabels()', () => {
  //   it('should really really do something', () => {
  //
  //   });
  // });

});
