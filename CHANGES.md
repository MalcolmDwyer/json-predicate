# 0.9.5
* Fixed https://github.com/MalcolmDwyer/json-predicate/issues/6
  - Some cases were returning undefined when test non-existent paths.

# 0.9.4
* Fixed https://github.com/MalcolmDwyer/json-predicate/issues/5
  - OR operation with empty apply array now returns true instead of false.

# 0.9.3

* Fixed https://github.com/MalcolmDwyer/json-predicate/issues/3
 - Added 'contained' op.
 - Added 'intersects' op.



# 0.9.2
* Upgraded dependencies
 * lodash 3.2.0 -> 4.6.1
 * mocha 2.3.0 -> 2.4.5
 * chai 3.2.0 -> 3.5.0


* Fixed https://github.com/MalcolmDwyer/json-predicate/issues/2
 - ReferenceError with bogus paths fixed.
