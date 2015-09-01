# json-predicate
Javascript implementation of the [JSON Predicate (Snell) spec](http://tools.ietf.org/id/draft-snell-json-test-01.html).

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

## operations
# [First Order Predicates](#first)
  # [contains](#contains)
  # [defined](#defined)
  # ...
# [Second Order Predicates](#second)
  # ...

### First Order Predicates [first]
#### contains
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

jsonTest(data, predicate); --> true
```
#### defined
```
var data = {
  a: {
    b: 'Smart People on Ice!'
  }
};

var predicate = {
  op: 'defined',
  path: '/a/b'
}

jsonTest(data, predicate); --> true

predicate = {
  op: 'defined',
  path: '/a/c'
}

jsonTest(data, predicate); --> false
```

### Second Order Predicates [second]
