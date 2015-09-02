# json-predicate

> Currently under active development as of September 1, 2015.  Not
all operations are implemented yet.  Expecting to have a working release
within about two weeks.

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
  * [in](#in) (not implemented yet)
  * [less](#less) (not implemented yet)
  * [matches](#matches) (not implemented yet)
  * [more](#more) (not implemented yet)
  * [starts](#starts)
  * [test](#test) (not implemented yet)
  * [type](#type) (not implemented yet)
  * [undefined](#undefined) (not implemented yet)
* Second Order Predicates
  * [and](#and)
  * [not](#not) (not implemented yet)
  * [or](#or) (not implemented yet)

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

#### or
Check if any of two or more sub-predicates are true.
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
  op: 'and',
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
