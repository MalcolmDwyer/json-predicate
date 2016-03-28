# json-predicate

[![npm version](https://badge.fury.io/js/json-predicate.svg)](https://badge.fury.io/js/json-predicate)
[![Build Status](https://travis-ci.org/MalcolmDwyer/json-predicate.svg?branch=master)](https://travis-ci.org/MalcolmDwyer/json-predicate) [![Dependencies](https://david-dm.org/MalcolmDwyer/json-predicate.svg)](https://david-dm.org/MalcolmDwyer/json-predicate) [![Dev Dependencies](https://david-dm.org/MalcolmDwyer/json-predicate/dev-status.svg)](https://david-dm.org/MalcolmDwyer/json-predicate#info=devDependencies)

**[Version History](./CHANGES.md "CHANGES.md")**

Check/Test/Validate if a block of JSON meets criteria defined by another block
of JSON.  This is a javascript implementation of the
[JSON Predicate (Snell) spec][1].

One likely use of this would be for passing data validations from the
back-end to the front-end in a programmatic way.  If your back-end is
validating incoming data on an API, then it may be useful to send those
same validations to the front-end so forms can be checked proactively
for the user.  The [JSON Predicate spec][1] defines the interchange,
and this library takes care of reading those validations on the front-end.
Now you just need a way to have your back-end serialize out your validations
in the JSON predicate format.  (Good luck with that!)

Please note that this library does not deal directly with JSON strings, themselves.
Instead, it is assumed that the JSON has already been parsed into regular
Javascript objects/arrays/expressions.

Given that this library deals with Javascript data (and not the actual JSON
strings), it adds a few extra capabilities when it comes to type checking and
regular expression matching.


## Installation

node:
```bash
$ npm install json-predicate
````

## Usage
```javascript
var jsonPredicate = require('json-predicate');
var jsonTest = jsonPredicate.test;

var passesPredicate = jsonTest(inputData, predicate);
// --> True/False
```

## Operations
* First Order Predicates
  * [contains](#contains)
  * [defined](#defined)
  * [ends](#ends)
  * [in](#in)
  * [less](#less)
  * [matches](#matches)
  * [more](#more)
  * [starts](#starts)
  * [test](#test)
  * [type](#type)
  * [undefined](#undefined)
  * [contained](#contained) - Not in original spec
  * [intersects](#intersects) - Not in original spec
* Second Order Predicates
  * [and](#and)
  * [not](#not)
  * [or](#or)

#### contains
Check if the string at `path` includes the provided substring.
Add `ignore_case: true` to make the check case-insensitive.
```javascript
var data = {
  a: {
    b: 'Smart People on Ice!'
  }
};

var predicate = {
  op: 'contains',
  path: '/a/b',
  value: 'People'
}

jsonTest(data, predicate); // true

predicate = {
  op: 'contains',
  path: '/a/b',
  value: 'sMaRt PeOpLe',
  ignore_case: true
};

jsonTest(data, predicate); // true
```
#### defined
Check if the key at `path` exists (is not undefined).
```javascript
var data = {
  a: {
    b: 'You\'ve seen him too?',
    c: null
  }
};

var predicate = {
  op: 'defined',
  path: '/a/b'
}
jsonTest(data, predicate); // true

var predicate = {
  op: 'defined',
  path: '/a/c'
}
jsonTest(data, predicate); // true

predicate = {
  op: 'defined',
  path: '/a/z'
}
jsonTest(data, predicate); // false
```

#### ends
Check if the string at `path` ends with the provided substring.
Add `ignore_case: true` to make the check case-insensitive.
```javascript
var data = {
  a: {
    b: 'Smart People on Ice!'
  }
};

var predicate = {
  op: 'ends',
  path: '/a/b',
  value: ' Ice!'
}

jsonTest(data, predicate); // true

predicate = {
  op: 'ends',
  path: '/a/b',
  value: 'On ICE!',
  ignore_case: true
};

jsonTest(data, predicate); // true
```

#### in
Check if the value at `path` is included in the provided value array.  Compares objects
deeply (using lodash [_.isEqual](https://lodash.com/docs#isEqual) under the
hood).  `ignore_case:true` can be passed to allow mismatched strings.
```javascript
  var data = {
    firstName: 'Mitch',
    lastName: 'Taylor'
  }

  var predicate = {
    op: 'in',
    path: '/firstName',
    value: ['chris', 'mitch', 'kent', 'jordan'],
    ignore_case: true
  }

  jsonTest(data, predicate); // true

  var data = {
    title: 'Everything',
    host: {
      firstName: 'Jerry',
      lastName: 'Hathaway'
    }
  };

  var predicate = {
    op: 'in',
    path: '/host',
    value: [
      {firstName: 'Jerry', lastName: 'Hathaway'},
      {firstName: 'Albert', lastName: 'Einstein'}
    ]
  }

  jsonTest(data, predicate); // true
```

#### less
Check if the numeric value at `path` is less than the provided value.
Returns false if either the value at `path` or the predicate value is
non-numeric.
```javascript
  var data = {
    a: 1984
  }

  var predicate = {
    op: 'less',
    path: '/a',
    value: 1985
  }

  jsonTest(data, predicate); // true
```

#### matches
Check if the string value at `path` satisfies the provided [regex](https://en.wikipedia.org/wiki/Regular_expression).  The
predicate value can be given directly as a regex, or as a string to be turned
into a regex.  `ignore_case:true` can also be added to the predicate to make the
regex test case-insensitive.

```javascript
  var data = {
    laser: {
      e: '1x10^6J/l' // "... That's hotter than the sun!"
    }
  }

  var predicate = {
    op: 'matches',
    path: '/laser/e',
    value: '[1-9x^]*J\/l' // pass regex as string
  }

  jsonTest(data, predicate); // true

  var predicate = {
    op: 'matches',
    path: '/laser/e',
    value: /[1-9x^]*J\/l/ // or pass regex directly
  }

  jsonTest(data, predicate); // true

```

#### more
Check if the numeric value at `path` is more than the provided value.
Returns false if either the value at `path` or the predicate value is
non-numeric.
```javascript
  var data = {
    a: 1984
  }

  var predicate = {
    op: 'more',
    path: '/a',
    value: 1983
  }

  jsonTest(data, predicate); // true
```

#### starts
Check if the string at `path` starts with the provided substring.
Add `ignore_case: true` to make the check case-insensitive.
```javascript
var data = {
  a: {
    b: 'Smart People on Ice!'
  }
};

var predicate = {
  op: 'starts',
  path: '/a/b',
  value: 'Smart People'
}

jsonTest(data, predicate); // true

predicate = {
  op: 'starts',
  path: '/a/b',
  value: 'sMaRt',
  ignore_case: true
};

jsonTest(data, predicate); // true
```

#### test
Check if the value at `path` is equal to the provided value.  Compares objects
deeply (using lodash [_.isEqual](https://lodash.com/docs#isEqual) under the
hood).  `ignore_case:true` can be passed to allow mismatched strings.
```javascript

  // Match strings:
  var data = {
    firstName: 'Mitch',
    lastName: 'Taylor'
  }

  var predicate = {
    op: 'test',
    path: '/firstName',
    value: 'mitch',
    ignore_case: true
  }

  jsonTest(data, predicate); // true

  // Match objects:
  var data = {
    title: 'Everything',
    host: {
      firstName: 'Jerry',
      lastName: 'Hathaway'
    }
  };

  var predicate = {
    op: 'test',
    path: '/host',
    value: {firstName: 'Jerry', lastName: 'Hathaway'}
  }

  jsonTest(data, predicate); // true

  // Match numbers:
  var data = {
    laser: {
      wavelength: 600,
      unit: 'nm'
    }
  }

  var predicate = {
    op: 'test',
    path: '/laser/wavelength',
    value: 600
  }

  jsonTest(data, predicate); // true
```

#### type
Check if the key at `path` is of the type given in the predicate value.
Types can be:
* `number`
* `string`
* `boolean`
* `object`
* `array`
* `null`
* `undefined`
* `date` (A string conforming to [RFC3339][2] 'full-date' spec)
* `date-time` (A string conforming to [RFC3339][2] 'date-time' spec)
* `time` (A string conforming to [RFC3339][2] 'full-time' spec)
* `lang` (A string conforming to [RFC4646][3] 'Language-Tag' spec)
* `lang-range` (A string conforming to [RFC4647][4] 'language-range')
* `iri` (A string conforming to [RFC3987][5] 'IRI-reference' spec)
* `absolute-iri` (A string conforming to [RFC3987][5] 'IRI' spec)

> **Note**: date, date-time, time string matching is based on the following
> regular expressions.  They may not exactly match the RFC specs.  I invite
> pull requests or recommendations for libraries to depend on.
>  * date: `/^\d{4}-\d{2}-\d{2}$/`
>  * date-time: `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?((?:[\+\-]\d{2}:\d{2})|Z)$/`
>  * time: `/^\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?((?:[\+\-]\d{2}:\d{2})|Z)$/`

<br>

> **Note**: lang and lang-range string matching is based on the following
> regular expressions.  They may not exactly match RFC specs.  I invite
> pull requests or recommendations for libraries to depend on.
>  * lang: `/^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$/`
>  * lang-range: `/^\*|[A-Z]{1,8}(?:-[\*A-Za-z0-9]{1,8})?$/`

<br>

> **Note**: iri and absolute-iri string matching is based on the
> [valid-url](https://www.npmjs.com/package/valid-url) library.  With
> `validUrl.isUri()` being used for `'iri'` type, and `validUrl.isWebUri()`
> being used for `'absolute-iri'`.  This is almost certainly not the correct
> behavior with respect to [RFC3987][5] and the JSON-predicate spec.  In invite
> pull requests or recommendations to improve this.

```javascript
var data = {
  num: 23,
  str: "little pickles",
  bool: true,
  obj: { firstName: "Lazlo", lastName: "Hollyfeld" },
  arr: ['tracking system', 'large spinning mirror'],
  nil: null,
  d: '1985-08-07',
  dt: '1985-08-07T19:00:00Z',
  t: '19:00:00-05:00',
  l: 'en-US',
  lr: 'CH-*',
  iri: 'https://github.com/MalcolmDwyer/json-predicate#type',
  absIri: 'https://github.com/MalcolmDwyer/json-predicate'
}

jsonTest(data, {op:'type', path:'/num',       value:'number'});       // true
jsonTest(data, {op:'type', path:'/str',       value:'string'});       // true
jsonTest(data, {op:'type', path:'/bool',      value:'boolean'});      // true
jsonTest(data, {op:'type', path:'/obj',       value:'object'});       // true
jsonTest(data, {op:'type', path:'/arr',       value:'array'});        // true
jsonTest(data, {op:'type', path:'/nil',       value:'null'});         // true
jsonTest(data, {op:'type', path:'/not_a_key', value:'undefined'});    // true
jsonTest(data, {op:'type', path:'/d',         value:'date'});         // true
jsonTest(data, {op:'type', path:'/dt',        value:'date-time'});    // true
jsonTest(data, {op:'type', path:'/t',         value:'time'});         // true
jsonTest(data, {op:'type', path:'/l',         value:'lang'});         // true
jsonTest(data, {op:'type', path:'/lr',        value:'lang-range'});   // true
jsonTest(data, {op:'type', path:'/iri',       value:'iri'});          // true
jsonTest(data, {op:'type', path:'/absIri',    value:'absolute-iri'}); // true
```

#### undefined
Check if the key at `path` does not exist (is undefined).
```javascript
var data = {
  a: {
    b: 'You\'ve seen him too?',
    c: null
  }
};

predicate = {
  op: 'undefined',
  path: '/a/z'
}
jsonTest(data, predicate); // true

var predicate = {
  op: 'undefined',
  path: '/a/b'
}
jsonTest(data, predicate); // false

var predicate = {
  op: 'undefined',
  path: '/a/c'
}
jsonTest(data, predicate); // false
```

#### contained
> **Note:** This operation is not included in the Snell json-predicate spec.  If you are sharing predicates with other implementations, you should avoid using this op.

Check if the key at `path` (which must be an array) contains the value given.  (Inverse of `in`, which has the array in the predicate and the single value in the data).  Can compare strings, numbers, shallow and deep objects.  Operation honors the ignore_case parameter when comparing string values.
```javascript
var data = {
  a: {
    b: [1983, 1984, 1985]
  }
}

var predicate = {
  op: 'contained',
  path: '/a/b',
  value: 1984
}

jsonTest(data, predicate); // true
```

#### intersects
> **Note:** This operation is not included in the Snell json-predicate spec.  If you are sharing predicates with other implementations, you should avoid using this op.

Check if the key at `path` (which must be an array) has any matching values in common with the provided array data (which also must be an array).  As long as one or more elements in the two arrays match (numeric, string, shallow or deep object comparisons, etc.), then the test will return true.  If either value is not an array, or if no array elements are found in common, then it returns false. Operation honors the ignore_case parameter for string comparisons.
```javascript
var data = {
  a: {
    b: [1983, 1984, 1985]
  }
}

var predicate = {
  op: 'contained',
  path: '/a/b',
  value: [1984, 1988, 1992]
}

jsonTest(data, predicate); // true
```


#### and
Check if two or more sub-predicates are true.
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'and',
  apply: [
    {
      op: 'contains',
      path: '/a/b',
      value: 'faster!'
    },
    {
      op: 'contains',
      path: '/a/c',
      value: 'labs'
    }
  ]
}
jsonTest(data, predicate); // true
```

Paths can also be defined in layers:
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'and',
  path: '/a',
  apply: [
    {
      op: 'contains',
      path: '/b',
      value: 'faster!'
    },
    {
      op: 'contains',
      path: '/c',
      value: 'labs'
    }
  ]
}
jsonTest(data, predicate); // true
```

#### or
Check if any of two or more sub-predicates are true.
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'or',
  apply: [
    {
      op: 'contains',
      path: '/a/b',
      value: 'faster!' // true
    },
    {
      op: 'contains',
      path: '/a/c',
      value: 'Get out, Lightman!' // false
    }
  ]
}
jsonTest(data, predicate); // true

predicate = {
  op: 'or',
  apply: [
    {
      op: 'contains',
      path: '/a/b',
      value: 'Protovision, I have you now!' // false
    },
    {
      op: 'contains',
      path: '/a/c',
      value: 'Get out, Lightman!' // false
    }
  ]
}
jsonTest(data, predicate); // false
```

Paths can also be defined in layers:
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'or',
  path: '/a',
  apply: [
    {
      op: 'contains',
      path: '/b',
      value: 'faster!' // true
    },
    {
      op: 'contains',
      path: '/c',
      value: 'Mr. Potatohead!' // false
    }
  ]
}
jsonTest(data, predicate); // true
```


#### not
Check if two or more sub-predicates are all false.  Equivalent to a logical NOR operation.
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'not',
  apply: [
    {
      op: 'contains',
      path: '/a/b',
      value: 'Joshua, what are you doing?' // false
    },
    {
      op: 'contains',
      path: '/a/c',
      value: 'Hi, Lightman!' // false
    }
  ]
}
jsonTest(data, predicate); // true
```

Paths can also be defined in layers:
```javascript
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don\'t know; I found it in one of the labs.'
  }
}

predicate = {
  op: 'not',
  path: '/a',
  apply: [
    {
      op: 'contains',
      path: '/b',
      value: 'Joshua, what are you doing?' // false
    },
    {
      op: 'contains',
      path: '/c',
      value: 'Hi, Lightman!' // false
    }
  ]
}
jsonTest(data, predicate); // true
```

[1]: http://tools.ietf.org/id/draft-snell-json-test-01.html
[2]: http://tools.ietf.org/html/rfc3339
[3]: http://tools.ietf.org/html/rfc4646
[4]: http://tools.ietf.org/html/rfc4647
[5]: http://tools.ietf.org/html/rfc3987
