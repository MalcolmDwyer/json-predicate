# json-predicate
Javascript implementation of the [JSON Predicate (Snell) spec](http://tools.ietf.org/id/draft-snell-json-test-01.html).

> Currently under active development as of September 1, 2015.  Not
all operations are implemented yet.

## Installation

node:
```
$ npm install json-predicate
````

## Usage
```
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
* Second Order Predicates
  * [and](#and)
  * [not](#not)
  * [or](#or)

#### contains
Check if the string at `path` includes the provided substring.
Add `ignore_case: true` to make the check case-insensitive.
```
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
```
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
```
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

#### starts
Check if the string at `path` starts with the provided substring.
Add `ignore_case: true` to make the check case-insensitive.
```
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

#### and
Check if two or more sub-predicates are true.
```
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don't know; I found it in one of the labs.'
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
```
var data = {
  a: {
    b: 'Much further, much faster!',
    c: 'I don't know; I found it in one of the labs.'
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
