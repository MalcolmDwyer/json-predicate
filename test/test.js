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

  // If the "value" member specifies "date", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "full-date" construct.
  // If the "value" member specifies "time", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "full-time" construct.
  // If the "value" member specifies "date-time", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "date-time" construct.
  // If the "value" member specifies "lang", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC4646] "Language-Tag" construct.
  // If the "value" member specifies "lang-range", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC4647] "language-range" construct.
  // If the "value" member specifies "iri", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3987] "IRI-reference" construct.
  // If the "value" member specifies "absolute-iri", the type predicate will evaluate a true if the value referenced by the "path" member is a JSON string conforming to the [RFC3987] "IRI" construct.

  before(function() {
    in0 = {
      num1: 1,
      null1: null,
      stringA: 'A',
      stringABC: 'ABC',
      stringAbC_123: 'AbC_123',
      arrayA: ['a','b', 'c'],
      arrayB: ['a', {foo: 'b'}, 3],
      arrayC: ['a', {foo: {bar: 'b'}}, 3],
      arrayN: ['a', {foo: {num1: 1}}, 3],
      objA: {
        num2: 2,
        null2: null,
        boolT: true,
        boolF: false,
        dateObj: new Date('2010-10-10T10:10:10Z'),
        dateTime: '2010-10-10T10:10:10Z',
        dateTimeOffset: '2010-10-10T10:10:10+05:30',
        date: '2010-10-10',
        timeZ: '10:10:10Z',
        timeOffset: '10:10:10+05:30',
        lang: 'en-US',
        langRange: 'CH-*',
        langRange2: '*',
        langRange3: 'CH-de',
        iri: 'https://github.com/MalcolmDwyer/json-predicate#test',
        absoluteIri: 'https://github.com/MalcolmDwyer/json-predicate',
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
      },
      objX: {
        num1: 1,
        stringAbc: 'Abc',
        objY: {
          num2: 2
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

  it('returns false for path into undefined part of data', function() {
    pred = {
      op: 'in',
      path: '/objZZZ/objZZZZZZZZ',
      value: ['does not matter']
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

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('matches operation', function() {
      beforeEach(function() {
        pred = {
          op: 'matches'
        };
      });

      it('returns false for any non-string target path', function() {
        pred.value = "[\\w\\s]*";

        pred.path = '/num1';
        result = test(in0, pred);
        result.should.be.false;

        pred.path = '/null1';
        result = test(in0, pred);
        result.should.be.false;

        pred.path = '/objA';
        result = test(in0, pred);
        result.should.be.false;

        pred.path = '/arrayA';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for string that would make an invalid regex', function() {
        pred.path = '/stringABC';
        pred.value = '\\';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for any value other than a RegExp or a string', function() {
        pred.path = '/stringABC';

        pred.value = 1;
        result = test(in0, pred);
        result.should.be.false;

        pred.value = {a:1};
        result = test(in0, pred);
        result.should.be.false;

        pred.value = ['a', 'b', 'c'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for match when providing string that will become RegExp', function() {
        pred.value = "[A-Z]*";
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for different case string with ignore_case: true', function() {
        pred.value = "aBc";
        pred.path = '/stringABC';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for different case string without ignore_case: true', function() {
        pred.value = "aBc";
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true when providing matching RegExp directly', function() {
        pred.value = /[A-Z]+/;
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false when providing matching RegExp directly with mismatch case', function() {
        pred.value = /[a-z]+/;
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true when providing matching (/i) RegExp directly with mismatch case', function() {
        pred.value = /[a-z]+/i;
        pred.path = '/stringABC';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true when providing matching (/i) RegExp directly with mismatch case', function() {
        pred.value = /[a-z]+/;
        pred.path = '/stringABC';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for undefined value', function() {
        pred.value = /[whatever]/;
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = /[whatever]/;
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('in operation', function() {
      beforeEach(function() {
        pred = {
          op: 'in'
        };
      });

      it('returns true for string value contained in supplied array', function() {
        pred.path = '/stringABC',
        pred.value = ['foo', 'ABC', 'bar'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for string mismatched only by case, with ignore_case false', function() {
        pred.path = '/stringABC',
        pred.value = ['foo', 'aBc', 'bar'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for string mismatched only by case, with ignore_case true', function() {
        pred.path = '/stringABC',
        pred.value = ['foo', 'aBc', 'bar'];
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for shallow object in supplied array', function() {
        pred.path = '/objX/objY',
        pred.value = ['foo', {num2:2}, 'bar'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for deep object in supplied array', function() {
        pred.path = '/objX',
        pred.value = ['foo', {num1:1, stringAbc: 'Abc', objY: {num2:2}}, 'bar'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for number value contained in supplied array', function() {
        pred.path = '/objA/num2',
        pred.value = [{foo: 'foo'}, 2, 'bar'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false if value is not an array', function() {
        pred.path = '/stringA',
        // Trying to trick it by supplying a subset of the value string
        pred.value = 'ABC'
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for string match inside object, honoring ignore_case', function() {
        pred.path = '/objX',
        pred.value = ['foo', {num1:1, stringAbc: 'aBc', objY: {num2:2}}, 'bar'];
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for string inside object mismatched only by case, with ignore_case false', function() {
        pred.path = '/objX',
        pred.value = ['foo', {num1:1, stringAbc: 'aBc', objY: {num2:2}}, 'bar'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value', function() {
        pred.value = ['does not matter'];
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = ['does not matter'];
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });

    });

    describe('test operation', function() {
      beforeEach(function() {
        pred = {
          op: 'test'
        };
      });

      it('returns true for matching string value', function() {
        pred.path = '/stringABC',
        pred.value = 'ABC';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for string mismatched only by case, with ignore_case false', function() {
        pred.path = '/stringABC',
        pred.value = 'aBc';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for string mismatched only by case, with ignore_case true', function() {
        pred.path = '/stringABC',
        pred.value = 'aBc';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for matching shallow object', function() {
        pred.path = '/objX/objY',
        pred.value = {num2:2};
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for matching deep object', function() {
        pred.path = '/objX',
        pred.value = {num1:1, stringAbc: 'Abc', objY: {num2:2}};
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for matching number value', function() {
        pred.path = '/objA/num2',
        pred.value = 2;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for matching array', function() {
        pred.path = '/arrayA',
        pred.value = ['a', 'b', 'c'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for superset array', function() {
        pred.path = '/arrayA',
        pred.value = ['a', 'b', 'c', 'd'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for subset array', function() {
        pred.path = '/arrayA',
        pred.value = ['a', 'b'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for string disguised as array', function() {
        pred.path = '/arrayA',
        pred.value = 'abcd';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for array disguised as a string', function() {
        pred.path = '/stringABC',
        pred.value = ['A', 'B', 'C'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for string match inside object, honoring ignore_case', function() {
        pred.path = '/objX',
        pred.value = {num1:1, stringAbc: 'aBc', objY: {num2:2}};
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for string inside object mismatched only by case, with ignore_case false', function() {
        pred.path = '/objX',
        pred.value = {num1:1, stringAbc: 'aBc', objY: {num2:2}};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
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

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
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

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
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

    describe('undefined operation', function() {
      beforeEach(function() {
        pred = {
          op: 'undefined'
        };
      });

      it('returns true for non-existent key (shallow path)', function() {
        pred.path = '/not_a_key';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for non-existent key (deep path)', function() {
        pred.path = '/objA/not_a_key';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for existing key (shallow path)', function() {
        pred.path = '/num1';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for existing key with null value (shallow path)', function() {
        pred.path = '/null1';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for existing key (deep path)', function() {
        pred.path = '/objA/objB/num3';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for existing key with null value (deep path)', function() {
        pred.path = '/objA/objB/null3';
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

      it('returns false for undefined value', function() {
        pred.value = 3;
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 3;
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
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

      it('returns false for undefined value', function() {
        pred.value = 3;
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 3;
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('type operation', function() {
      beforeEach(function() {
        pred = {
          op: 'type'
        };
      });
      // If the "value" member specifies "number", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON number.
      it ('returns true when matching number to type "number"', function() {
        pred.path = '/objA/num2';
        pred.value = 'number';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching string to type "number"', function() {
        pred.path = '/objA/stringXYZ';
        pred.value = 'number';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "string", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string.
      it ('returns true when matching string to type "string"', function() {
        pred.path = '/objA/stringXYZ';
        pred.value = 'string';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "string"', function() {
        pred.path = '/objA/num2';
        pred.value = 'string';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "boolean", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON boolean.
      it ('returns true when matching boolean to type "boolean"', function() {
        pred.path = '/objA/boolT';
        pred.value = 'boolean';
        result = test(in0, pred);
        result.should.be.true;

        pred.path = '/objA/boolF';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "boolean"', function() {
        pred.path = '/objA/num2';
        pred.value = 'boolean';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "object", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON object.
      it ('returns true when matching object to type "object"', function() {
        pred.path = '/objA/objB';
        pred.value = 'object';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "object"', function() {
        pred.path = '/objA/num2';
        pred.value = 'object';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "array", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON array.
      it ('returns true when matching array to type "array"', function() {
        pred.path = '/arrayA';
        pred.value = 'array';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "array"', function() {
        pred.path = '/objA/num2';
        pred.value = 'array';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "null", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON null.
      it ('returns true when matching null to type "null"', function() {
        pred.path = '/objA/null2';
        pred.value = 'null';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "null"', function() {
        pred.path = '/objA/num2';
        pred.value = 'null';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "undefined", the type predicate will evaluate as true if the member referenced by the "path" member does not exist.
      it ('returns true when matching undefined to type "undefined"', function() {
        pred.path = '/objA/not_a_thing';
        pred.value = 'undefined';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching number to type "undefined"', function() {
        pred.path = '/objA/num2';
        pred.value = 'undefined';
        result = test(in0, pred);
        result.should.be.false;
      });

      // If the "value" member specifies "date", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "full-date" construct.
      it ('returns true when matching date to type "date"', function() {
        pred.path = '/objA/date';
        pred.value = 'date';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching date-time to type "date"', function() {
        pred.path = '/objA/dateTime';
        pred.value = 'date';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "time", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "full-time" construct.
      it ('returns true when matching time (Z) to type "time"', function() {
        pred.path = '/objA/timeZ';
        pred.value = 'time';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns true when matching time (offset) to type "time"', function() {
        pred.path = '/objA/timeOffset';
        pred.value = 'time';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching date-time to type "time"', function() {
        pred.path = '/objA/dateTime';
        pred.value = 'time';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "date-time", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3339] "date-time" construct.
      it ('returns true when matching date-time (Z) to type "date-time"', function() {
        pred.path = '/objA/dateTime';
        pred.value = 'date-time';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns true when matching date-time (offset) to type "date-time"', function() {
        pred.path = '/objA/dateTimeOffset';
        pred.value = 'date-time';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching date to type "date-time"', function() {
        pred.path = '/objA/date';
        pred.value = 'date-time';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "lang", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC4646] "Language-Tag" construct.
      it ('returns true when matching lang to type "lang"', function() {
        pred.path = '/objA/lang';
        pred.value = 'lang';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching num to type "lang"', function() {
        pred.path = '/objA/num2';
        pred.value = 'lang';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "lang-range", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC4647] "language-range" construct.
      it ('returns true when matching lang-range to type "lang-range"', function() {
        pred.path = '/objA/langRange';
        pred.value = 'lang-range';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns true when matching lang-range2 to type "lang-range"', function() {
        pred.path = '/objA/langRange2';
        pred.value = 'lang-range';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns true when matching lang-range3 to type "lang-range"', function() {
        pred.path = '/objA/langRange3';
        pred.value = 'lang-range';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching num to type "lang-range"', function() {
        pred.path = '/objA/num2';
        pred.value = 'lang-range';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "iri", the type predicate will evaluate as true if the value referenced by the "path" member is a JSON string conforming to the [RFC3987] "IRI-reference" construct.
      it ('returns true when matching iri to type "iri"', function() {
        pred.path = '/objA/iri';
        pred.value = 'iri';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching num to type "iri"', function() {
        pred.path = '/objA/num2';
        pred.value = 'iri';
        result = test(in0, pred);
        result.should.be.false;
      });
      // If the "value" member specifies "absolute-iri", the type predicate will evaluate a true if the value referenced by the "path" member is a JSON string conforming to the [RFC3987] "IRI" construct.
      it ('returns true when matching iri to type "absolute-iri"', function() {
        pred.path = '/objA/absoluteIri';
        pred.value = 'absolute-iri';
        result = test(in0, pred);
        result.should.be.true;
      });
      it ('returns false when matching num to type "absolute-iri"', function() {
        pred.path = '/objA/num2';
        pred.value = 'absolute-iri';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('contained operation', function() {
      beforeEach(function() {
        pred = {
          op: 'contained'
        };
      });

      it('returns false when pred.path does not point to an array', function() {
        pred.path = '/num1',
        pred.value = 1;
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing in supplied value', function() {
        pred.path = '/arrayA',
        pred.value = 'a';
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing string mismatched only by case, with ignore_case false', function() {
        pred.path = '/arrayA',
        pred.value = 'A';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing string mismatched only by case, with ignore_case true', function() {
        pred.path = '/arrayA',
        pred.value = 'A';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing matching shallow object', function() {
        pred.path = '/arrayB',
        pred.value = {foo: 'b'};
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing mismatched shallow object', function() {
        pred.path = '/arrayB',
        pred.value = {foo: 'c'};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing matching deep object', function() {
        pred.path = '/arrayC',
        pred.value = {foo: {bar: 'b'}};
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing mismatching deep object', function() {
        pred.path = '/arrayC',
        pred.value = {foo: {bar: 'c'}};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for array containing shallow object, matching except for case', function() {
        pred.path = '/arrayB',
        pred.value = {foo: 'B'};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing shallow object, matching with ignore_case', function() {
        pred.path = '/arrayB',
        pred.value = {foo: 'B'};
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing deep object, matching except for case', function() {
        pred.path = '/arrayC',
        pred.value = {foo: {bar: 'B'}};
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing deep object, matching with ignore_case', function() {
        pred.path = '/arrayC',
        pred.value = {foo: {bar: 'B'}};
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing numeric value', function() {
        pred.path = '/arrayN',
        pred.value = 3;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing deep object with numeric value', function() {
        pred.path = '/arrayN',
        pred.value = {foo: {num1: 1}};

        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for undefined value', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = 'does not matter';
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.false;
      });
    });

    describe('intersects operation', function() {
      beforeEach(function() {
        pred = {
          op: 'intersects'
        };
      });

      it('returns false when pred.path does not point to an array', function() {
        pred.path = '/num1',
        pred.value = [1];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing in supplied single-value array', function() {
        pred.path = '/arrayA',
        pred.value = ['a'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing string mismatched only by case, with ignore_case false', function() {
        pred.path = '/arrayA',
        pred.value = ['A'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing string mismatched only by case, with ignore_case true', function() {
        pred.path = '/arrayA',
        pred.value = ['A'];
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array match against array of values (1 match)', function() {
        pred.path = '/arrayA',
        pred.value = ['a', 'zzzzzz'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array match against array of values (all match)', function() {
        pred.path = '/arrayA',
        pred.value = ['a','b', 'c'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array match against array of values (all match + extras', function() {
        pred.path = '/arrayA',
        pred.value = ['a','b', 'c', 'zzzzzz'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing matching shallow object', function() {
        pred.path = '/arrayB',
        pred.value = [{foo: 'b'}, 'zzzzzz'];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing mismatched shallow object', function() {
        pred.path = '/arrayB',
        pred.value = ['zzzzzz', {foo: 'c'}];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing matching deep object', function() {
        pred.path = '/arrayC',
        pred.value = ['zzzzzz', {foo: {bar: 'b'}}];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing mismatching deep object', function() {
        pred.path = '/arrayC',
        pred.value = ['zzzzzz', {foo: {bar: 'c'}}];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for array containing shallow object, matching except for case', function() {
        pred.path = '/arrayB',
        pred.value = [{foo: 'B'}, 'zzzzzz'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing shallow object, matching with ignore_case', function() {
        pred.path = '/arrayB',
        pred.value = [{foo: 'B'}, 'zzzzzz'];
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for array containing deep object, matching except for case', function() {
        pred.path = '/arrayC',
        pred.value = [{foo: {bar: 'B'}}, 'zzzzzz'];
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns true for array containing deep object, matching with ignore_case', function() {
        pred.path = '/arrayC',
        pred.value = ['zzzzzz', {foo: {bar: 'B'}}];
        pred.ignore_case = true;
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing numeric value', function() {
        pred.path = '/arrayN',
        pred.value = ['zzzzzz', 3];
        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns true for array containing deep object with numeric value', function() {
        pred.path = '/arrayN',
        pred.value = ['zzzzzz', {foo: {num1: 1}}];

        result = test(in0, pred);
        result.should.be.true;
      });

      it('returns false for undefined value', function() {
        pred.value = ['does not matter'];
        pred.path = '/objZZZ/objZZZZZZZZ';
        result = test(in0, pred);
        result.should.be.false;
      });

      it('returns false for undefined value (with ignore_case:true)', function() {
        pred.value = ['does not matter'];
        pred.path = '/objZZZ/objZZZZZZZZ';
        pred.ignore_case = true;
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

      it('returns true for AND case with empty apply array', function() {
        pred.path = '/objA';
        pred.apply = [];
        result = test(in0, pred);
        result.should.be.true;
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

      it('returns true for OR case with empty apply array', function() {
        pred.path = '/objA';
        pred.apply = [];
        result = test(in0, pred);
        result.should.be.true;
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

      it('returns true for NOT case with empty apply array', function() {
        pred.path = '/objA';
        pred.apply = [];
        result = test(in0, pred);
        result.should.be.true;
      });
    });
  });
});
