var chai = require('chai');
var should = chai.should();
var jsonPred = require('../lib');
var test = jsonPred.test;


describe('json-predicate', function() {
  var in0, pred, result;

  before(function() {
    in0 = {
      num1: 1,
      null1: null,
      stringA: 'A',
      stringABC: 'ABC',
      stringABC_123: 'ABC_123',
      objA: {
        num2: 2,
        null2: null,
        stringX: 'X',
        stringXYZ: 'XYZ',
        stringXYZ_789: 'XYZ_789',
        objB: {
          num3: 3,
          null3: null,
          stringM: 'M',
          stringMNO: 'MNO',
          stringMNO_456: 'MNO_456'
        }
      }
    };
  });

  it('should return false for invalid predicate', function() {
    pred = {'foo': 'bar'};
    result = test(in0, pred);
    result.should.be.false;
  });

  it('should return false for empty predicate', function() {
    pred = {};
    result = test(in0, pred);
    result.should.be.false;
  });

  it('rejects unknown operations', function() {
    pred = {
      op: 'not_an_op',
      path: '/num1',
      value: 1
    }
    result = test(in0, pred);
    result.should.be.false;
  });

  describe('first order predicates', function() {
    describe('contains operation', function() {
      beforeEach(function() {
        pred = {
          op: 'contains'
        };
      });
      it('returns true for contained string (shallow path)', function() {
        pred.value = 'AB';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });
      it('returns false for non-contained string (shallow path)', function() {
        pred.value = 'XY';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('returns true for contained string (deep path)', function() {
        pred.value = 'MN';
        pred.path = '/objA/objB/stringMNO';
        result = test(in0, pred)
        result.should.be.true;
      });
      it('returns false for non-contained string (deep path)', function() {
        pred.value = 'AB';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred)
        result.should.be.false;
      });
    });

    describe('defined operation', function() {
      beforeEach(function() {
        pred = {
          op: 'defined'
        };
      });

      it('returns true for existing key (shallow path)', function() {
        pred.path = '/num1';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for existing key with null value (shallow path)', function() {
        pred.path = '/null1';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for non-existent key (shallow path)', function() {
        pred.path = '/not_a_key';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for existing key (deep path)', function() {
        pred.path = '/objA/objB/num3';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for existing key with null value (deep path)', function() {
        pred.path = '/objA/objB/null3';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for non-existent key (deep path)', function() {
        pred.path = '/objA/objB/not_a_key';
        result = test(in0, pred);
        result.should.be.false;
      });
    });
  });
});
