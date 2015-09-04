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

var _ = require('lodash/lang');

var ops = [
  'contains',
  'defined',
  'undefined',
  'ends',
  'starts',
  'less',
  'more',
  'in',
  'matches',

  'and',
  'or',
  'not'
  // ...
];

var first_order_ops = [
  'contains',
  'defined',
  'undefined',
  'ends',
  'starts',
  'less',
  'more',
  'in',
  'matches'
  //...
];
var requires_path = first_order_ops;

var requires_value = [
  'contains',
  'ends',
  'starts',
  'less',
  'more',
  'in',
  'matches'
];

var requires_array_value = [
  'in'
];

var requires_numeric_value = [
  'less',
  'more'
];

var second_order_ops = ['and', 'or', 'not'];
var requires_apply = second_order_ops;

function _includes(array, val) {
  var i, a;
  // while (a = array.shift()) {
  for (i = 0; i < array.length, a = array[i]; i++) {
    if (val === a) {
      return true;
    }
  }
  return false;
}

function equals(val1, val2, ignore_case) {
  // Override comparator for ignore_case:true
  return _.isEqual(val1, val2, function(v1, v2) {
    if (
      ignore_case &&
      typeof v1.toLowerCase === 'function' &&
      typeof v2.toLowerCase === 'function' &&
      v1.toLowerCase() === v2.toLowerCase()
    ) {
      return true;
    }
  });
}

function validatePredicate(predicate) {
  if (!predicate) {
    return false;
  }
  if (!predicate.op) {
    return false;
  }
  if (_includes(requires_path, predicate.op) && !predicate.path) {
    return false;
  }
  if (!_includes(ops, predicate.op)) {
    return false;
  }
  // check for value/apply depending on op
  if (_includes(requires_value, predicate.op) &&
     (typeof predicate.value === 'undefined'))
  {
    return false;
  }
  if (_includes(requires_apply, predicate.op) &&
     (typeof predicate.apply === 'undefined'))
  {
    return false;
  }
  if (_includes(requires_numeric_value, predicate.op) &&
     (!_.isNumber(predicate.value)))
  {
    return false;
  }
  if (_includes(requires_array_value, predicate.op) &&
     (!_.isArray(predicate.value)))
  {
    return false;
  }
  return true;
}

function dataAtPath(data, path) {
  var result, loc, locs = path.split('/');
  locs.shift();
  while(loc = locs.shift()) {
    result = data = data[loc];
  }
  return result;
}

/*
 * test
 *
 */
function test(data, predicate) {
  var i, subPred, subData, regex;
  if (!validatePredicate(predicate)) {
    return false;
  }

  var vut = predicate.path && dataAtPath(data, predicate.path);
  var t = predicate.value;
  if (predicate.ignore_case && predicate.value && typeof predicate.value.toLowerCase === 'function') {
    if (vut) {
      vut = vut.toLowerCase();
    }
    t = predicate.value.toLowerCase();
  }

  switch (predicate.op) {
    case 'contains': {
      return (vut && vut.indexOf(t) >= 0);
    }
    case 'defined': {
      return (typeof vut !== 'undefined');
    }
    case 'undefined': {
      return (typeof vut === 'undefined');
    }
    case 'ends': {
      return (vut && vut.indexOf(t) === (vut.length - t.length));
    }
    case 'starts': {
      return (vut && vut.indexOf(t) === 0);
    }
    case 'less': {
      return (_.isNumber(vut) && (vut < t));
    }
    case 'more': {
      return (_.isNumber(vut) && (vut > t));
    }
    case 'in': {
      for (i = 0; i < predicate.value.length; i++) {
        if (equals(vut, predicate.value[i], predicate.ignore_case || false)) {
          return true;
        }
      }
      return false;
    }
    case 'matches': {
      if (!_.isString(vut)) {
        return false;
      }
      if (!_.isString(predicate.value) && !(predicate.value instanceof RegExp)) {
        return false;
      }
      if (predicate.value instanceof RegExp) {
        if (predicate.ignore_case) {
          regex = new RegExp(predicate.value.source, 'i');
          return regex.test(vut);
        }
        else {
          return predicate.value.test(vut);
        }
      }
      else {
        try {
          if (predicate.ignore_case) {
            regex = new RegExp(predicate.value, 'i');
          }
          else {
            regex = new RegExp(predicate.value);
          }
          return regex.test(vut);
        }
        catch (e) {
          return false;
        }

      }
    }
    case 'and': {
      var result = true;
      subData = data;
      if (predicate.path) {
        subData = dataAtPath(data, predicate.path);
      }
      for (i = 0; i < predicate.apply.length; i++) {
        subPred = predicate.apply[i];
        result = result && test(subData, subPred);
      }
      return result;
    }
    case 'or': {
      var result = false;
      subData = data;
      if (predicate.path) {
        subData = dataAtPath(data, predicate.path);
      }
      for (i = 0; i < predicate.apply.length; i++) {
        subPred = predicate.apply[i];
        result = result || test(subData, subPred);
      }
      return result;
    }
    case 'not': {
      var result = true;
      subData = data;
      if (predicate.path) {
        subData = dataAtPath(data, predicate.path);
      }
      for (i = 0; i < predicate.apply.length; i++) {
        subPred = predicate.apply[i];
        result = result && !test(subData, subPred);
      }
      return result;
    }
    default: {
      return false;
    }
  }
}

module.exports = {
  test: test,
  dataAtPath: dataAtPath,
  validatePredicate: validatePredicate
}
