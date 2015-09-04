# json-predicate

> Currently under active development as of September 1, 2015.  Not
all operations are implemented yet.  Expecting to have a working release
within about two weeks.

[![Build Status](https://travis-ci.org/MalcolmDwyer/json-predicate.svg?branch=master)](https://travis-ci.org/MalcolmDwyer/json-predicate) [![Dependencies](https://david-dm.org/MalcolmDwyer/json-predicate.svg)](https://david-dm.org/MalcolmDwyer/json-predicate) [![Dev Dependencies](https://david-dm.org/MalcolmDwyer/json-predicate/dev-status.svg)](https://david-dm.org/MalcolmDwyer/json-predicate#info=devDependencies)

Check/Test/Validate if a block of JSON meets criteria defined
by another block of JSON.

One likely use of this would be for passing data validations from the
back-end to the front-end in a programmatic way.  If your back-end is
validating incoming data on an API, then it may be useful to send those
same validations to the front-end so forms can be checked proactively
for the user.  This library takes care of the front-end side.  Now you
just need a way to have your back-end serialize out your validations
in the JSON predicate format.  (Good luck with that!)

This is a javascript implementation of the [JSON Predicate (Snell) spec](http://tools.ietf.org/id/draft-snell-json-test-01.html).

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
  * [type](#type) (not implemented yet)
  * [undefined](#undefined)
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
    value: 1983
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
    value: 1985
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
