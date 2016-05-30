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
var validUrl = require('valid-url');

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
  'test',
  'type',
  'contained',
  'intersects',
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
  'matches',
  'test',
  'type',
  'contained',
  'intersects'
];
var requires_path = first_order_ops;

var requires_value = [
  'contains',
  'ends',
  'starts',
  'less',
  'more',
  'in',
  'matches',
  'test',
  'type',
  'contained',
  'intersects'
];

var requires_array_value = [
  'in',
  'intersects'
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
  return _.isEqualWith(val1, val2, function(v1, v2) {
    if (
      ignore_case &&
      v1 && typeof v1.toLowerCase === 'function' &&
      v2 && typeof v2.toLowerCase === 'function' &&
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
  while(data && (loc = locs.shift())) {
    result = data = data[loc];
  }
  return result;
}

/*
 * test
 *
 */
function test(data, predicate) {
  var i, subPred, subData, regex, valid;
  if (!validatePredicate(predicate)) {
    return false;
  }

  var vut = predicate.path && dataAtPath(data, predicate.path);
  var t = predicate.value;
  if (predicate.ignore_case) {
    if (vut && typeof vut.toLowerCase === 'function') {
      vut = vut.toLowerCase();
    }
    if (predicate.value && typeof predicate.value.toLowerCase === 'function') {
      t = predicate.value.toLowerCase();
    }
  }

  switch (predicate.op) {
    case 'contains': {
      return (typeof vut !== 'undefined' && vut.indexOf(t) >= 0);
    }
    case 'defined': {
      return (typeof vut !== 'undefined');
    }
    case 'undefined': {
      return (typeof vut === 'undefined');
    }
    case 'ends': {
      return (typeof vut !== 'undefined' && vut.indexOf(t) === (vut.length - t.length));
    }
    case 'starts': {
      return (typeof vut !== 'undefined' && vut.indexOf(t) === 0);
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
    case 'test': {
      return equals(vut, predicate.value, predicate.ignore_case || false);
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
    case 'type': {
      switch (predicate.value) {
        case 'array': {
          return _.isArray(vut);
        }
        case 'null': {
          return _.isNull(vut);
        }
        case 'date': {
          return /^\d{4}-\d{2}-\d{2}$/.test(vut);
        }
        case 'time': {
          return /^\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?((?:[\+\-]\d{2}:\d{2})|Z)$/.test(vut);
        }
        case 'date-time': {
          return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?((?:[\+\-]\d{2}:\d{2})|Z)$/.test(vut);
        }
        case 'lang': {
          return /^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$/.test(vut);
        }
        case 'lang-range': {
          return /^\*|[A-Z]{1,8}(?:-[\*A-Za-z0-9]{1,8})?$/.test(vut);
        }
        case 'iri': {
          try {
            valid = !!validUrl.isUri(vut);
          } catch (e) {
            return false;
          }
          return valid || false;
        }
        case 'absolute-iri': {
          try {
            valid = !!validUrl.isWebUri(vut);
          } catch (e) {
            return false;
          }
          return valid || false;
        }
        default: {
          return (typeof vut === predicate.value);
        }
      }
    }
    case 'contained': {
      if (!_.isArray(vut)) {
        return false;
      }
      for (i = 0; i < vut.length; i++) {
        if (equals(predicate.value, vut[i], predicate.ignore_case || false)) {
          return true;
        }
      }
      return false;
    }
    case 'intersects': {
      if (!_.isArray(vut)) {
        return false;
      }
      for (i = 0; i < vut.length; i++) {
        for (j = 0; j < predicate.value.length; j++) {
          if (equals(predicate.value[j], vut[i], predicate.ignore_case || false)) {
            return true;
          }
        }
      }
      return false;
    }
    case 'and': {
      var result = true;
      subData = data;
      if (predicate.path) {
        subData = dataAtPath(data, predicate.path);
      }
      for (i = 0; i < (predicate.apply && predicate.apply.length); i++) {
        subPred = predicate.apply[i];
        result = result && test(subData, subPred);
      }
      return result;
    }
    case 'or': {
      var result = false || !predicate.apply || !predicate.apply.length;
      subData = data;
      if (predicate.path) {
        subData = dataAtPath(data, predicate.path);
      }
      for (i = 0; i < (predicate.apply && predicate.apply.length); i++) {
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
      for (i = 0; i < (predicate.apply && predicate.apply.length); i++) {
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
