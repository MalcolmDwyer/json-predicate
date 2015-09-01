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

var first_order_ops = [
  'contains' //...
];

var requires_value = [
  'contains' //...
];

var second_order_ops = ['and', 'or', 'not'];
var requires_apply = ['and', 'or', 'not'];

function validatePredicate(predicate) {
  if (!predicate) {
    return false;
  }
  if (!predicate.path) {
    return false;
  }
  if (!predicate.op) {
    return false;
  }
  // TODO: check for value/apply depending on op
  return true;
}

function findPath(data, path) {
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

  if (!validatePredicate(predicate)) {
    return false;
  }
  var vut = findPath(data, predicate.path);
  switch (predicate.op) {
    case 'contains': {
      return (vut && vut.indexOf(predicate.value) >= 0)
    }
    default: {
      return false;
    }
  }
}

module.exports = {
  test: test,
  validatePredicate: validatePredicate
}
