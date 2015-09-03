/*
Copyright (c) 2015 Malcolm Dwyer <malcolm.dwyer@gmail.com>
MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
      stringAbC_123: 'AbC_123',
      objA: {
        num2: 2,
        null2: null,
        stringX: 'X',
        stringXYZ: 'XYZ',
        stringXyZ_789: 'XyZ_789',
        objB: {
          num3: 3,
          null3: null,
          stringM: 'M',
          stringMNO: 'MNO',
          stringMnO_456: 'MnO_456'
        }
      }
    };
  });

  it('returns false for invalid predicate', function() {
    pred = {'foo': 'bar'};
    result = test(in0, pred);
    result.should.be.false;
  });

  it('returns false for empty predicate', function() {
    pred = {};
    result = test(in0, pred);
    result.should.be.false;
  });

  it('returns false for unknown operations', function() {
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
      it('returns false for mismatching case (and ignore_case:false has no effect)', function() {
        pred.value = 'xy';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('honors ignore_case:true', function() {
        pred.value = 'xy';
        pred.path = '/objA/stringXYZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });
    });

    describe('ends operation', function() {
      beforeEach(function() {
        pred = {
          op: 'ends'
        };
      });
      it('returns true for end string (shallow path)', function() {
        pred.value = 'BC';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });
      it('returns false for non-ending string (shallow path)', function() {
        pred.value = 'AB';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('returns true for end string (deep path)', function() {
        pred.value = 'NO';
        pred.path = '/objA/objB/stringMNO';
        result = test(in0, pred)
        result.should.be.true;
      });
      it('returns false for non-ending string (deep path)', function() {
        pred.value = 'XY';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred)
        result.should.be.false;
      });
      it('returns false for mismatching case (and ignore_case:false has no effect)', function() {
        pred.value = 'yz';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('honors ignore_case:true', function() {
        pred.value = 'yz';
        pred.path = '/objA/stringXYZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });
    });

    describe('starts operation', function() {
      beforeEach(function() {
        pred = {
          op: 'starts'
        };
      });
      it('returns true for starting string (shallow path)', function() {
        pred.value = 'AB';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });
      it('returns false for non-starting string (shallow path)', function() {
        pred.value = 'BC';
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('returns true for start string (deep path)', function() {
        pred.value = 'MN';
        pred.path = '/objA/objB/stringMNO';
        result = test(in0, pred)
        result.should.be.true;
      });
      it('returns false for non-starting string (deep path)', function() {
        pred.value = 'YZ';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred)
        result.should.be.false;
      });
      it('returns false for mismatching case (and ignore_case:false has no effect)', function() {
        pred.value = 'xy';
        pred.path = '/objA/stringXYZ';
        result = test(in0, pred);
        result.should.be.false;
      });
      it('honors ignore_case:true', function() {
        pred.value = 'xy';
        pred.path = '/objA/stringXYZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
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

    describe('less operation', function() {
      beforeEach(function() {
        pred = {
          op: 'less'
        };
      });

      it('returns false for non-numeric comparisons', function() {
        pred.path = '/stringABC';
        pred.value = 'XYZ';

        result = test(in0, pred);
        result.should.be.false;
        // Check the reverse since a naïve string comparison
        // would return true for one of these.
        pred.path = '/objA/stringXYZ';
        pred.value = 'ABC';
        result = test(in0, pred);
        result.should.be.false;

        pred.value = ['a', 'b'];
        result = test(in0, pred);
        result.should.be.false;

        pred.value = {'a': 'foo', 'b': 'bar'};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for greater predicate value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 4;

        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for lesser predicate value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 2;

        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for equal numeric value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 3;

        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('more operation', function() {
      beforeEach(function() {
        pred = {
          op: 'more'
        };
      });

      it('returns false for non-numeric comparisons', function() {
        pred.path = '/stringABC';
        pred.value = 'XYZ';

        result = test(in0, pred);
        result.should.be.false;
        // Check the reverse since a naïve string comparison
        // would return true for one of these.
        pred.path = '/objA/stringXYZ';
        pred.value = 'ABC';
        result = test(in0, pred);
        result.should.be.false;

        pred.value = ['a', 'b'];
        result = test(in0, pred);
        result.should.be.false;

        pred.value = {'a': 'foo', 'b': 'bar'};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for greater predicate value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 4;

        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for lesser predicate value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 2;

        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for equal numeric value', function() {
        pred.path = '/objA/objB/num3';
        pred.value = 3;

        result = test(in0, pred);
        result.should.be.false;
      });
    });
  });

  describe('second order predicates', function() {
    describe('and operation', function() {
      beforeEach(function() {
        pred = {
          op: 'and'
        };
      });
      it('returns true for AND case with shallow endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/stringA'
          },
          {
            op: 'defined',
            path: '/stringABC'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for AND case with deep endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/objA/stringX'
          },
          {
            op: 'defined',
            path: '/objA/stringXYZ'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for AND case with (t,t) and compound paths', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/stringX'
          },
          {
            op: 'defined',
            path: '/stringXYZ'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for AND case with (t,t,t)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/stringX'
          },
          {
            op: 'defined',
            path: '/stringXYZ'
          },
          {
            op: 'defined',
            path: '/null2'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for AND case with (t,f)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/stringX'
          },
          {
            op: 'defined',
            path: '/not_real'
          }
        ];
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('or operation', function() {
      beforeEach(function() {
        pred = {
          op: 'or'
        };
      });
      it('returns true for OR case with shallow endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_thing'
          },
          {
            op: 'defined',
            path: '/stringABC'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for OR case with deep endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/objA/not_real_thing'
          },
          {
            op: 'defined',
            path: '/objA/stringXYZ'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for OR case with (t,f) and compound paths', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_thing'
          },
          {
            op: 'defined',
            path: '/stringXYZ'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for OR case with (t,f,t)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/stringX'
          },
          {
            op: 'defined',
            path: '/not_real_thing'
          },
          {
            op: 'defined',
            path: '/null2'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for OR case with (f,f)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_1'
          },
          {
            op: 'defined',
            path: '/not_real_2'
          }
        ];
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('not operation (a.k.a. logical NOR operation)', function() {
      beforeEach(function() {
        pred = {
          op: 'not'
        };
      });
      it('returns true for NOT case (f,f) with shallow endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_1'
          },
          {
            op: 'defined',
            path: '/not_real_2'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for NOT case (f,f) with deep endpoint paths', function() {
        pred.apply = [
          {
            op: 'defined',
            path: '/objA/not_real_1'
          },
          {
            op: 'defined',
            path: '/objA/not_real_2'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for NOT case with (t,f) and compound paths', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_thing'
          },
          {
            op: 'defined',
            path: '/stringXYZ'
          }
        ];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for OR case with (t,f,t)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/stringX'
          },
          {
            op: 'defined',
            path: '/not_real_thing'
          },
          {
            op: 'defined',
            path: '/null2'
          }
        ];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for OR case with (f,f)', function() {
        pred.path = '/objA';
        pred.apply = [
          {
            op: 'defined',
            path: '/not_real_1'
          },
          {
            op: 'defined',
            path: '/not_real_2'
          }
        ];
        result = test(in0, pred);
        result.should.be.true;
      });
    });
  });
});
