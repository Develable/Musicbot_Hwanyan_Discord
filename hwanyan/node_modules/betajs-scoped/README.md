# betajs-scoped 0.0.22
[![Build Status](https://api.travis-ci.org/betajs/betajs-scoped.svg?branch=master)](https://travis-ci.org/betajs/betajs-scoped)
[![Code Climate](https://codeclimate.com/github/betajs/betajs-scoped/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs-scoped)
[![NPM](https://img.shields.io/npm/v/betajs-scoped.svg?style=flat)](https://www.npmjs.com/package/betajs-scoped)
[![Gitter Chat](https://badges.gitter.im/betajs/betajs-scoped.svg)](https://gitter.im/betajs/betajs-scoped)

BetaJS-Scoped is a small module for scoped loading of modules and dependencies.



## Getting Started


You can use the library in the browser, in your NodeJS project and compile it as well.

#### Browser

```javascript
	<script src="betajs-scoped/dist/scoped.min.js"></script>
``` 

#### NodeJS

```javascript
	var Scoped = require('betajs-scoped/dist/scoped.js');
```

#### Compile

```javascript
	git clone https://github.com/betajs/betajs-scoped.git
	npm install
	grunt
```



## Basic Usage


```javascript
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:MyLibrary");
Scoped.binding("dependency1", "global:ExternalDependency1");
Scoped.binding("dependency2", "global:ExternalDependency2");

// Library code

}).call(Scoped);
```

```javascript
Scoped.require(['ns1:dependency1', 'ns2:dependency2', 'ns3:dependency3'], function (D1, D2, D3) {
    // Execute once D1, D2, D3 are resolved.
});

Scoped.define('ns:module', ['ns1:dependency1', 'ns2:dependency2', 'ns3:dependency3'], function (D1, D2, D3) {
    // Execute once D1, D2, D3 are resolved.
    return {
        // Return ns:module definition.
    };
});

Scoped.extend('ns:module', ['ns1:dependency1', 'ns2:dependency2', 'ns3:dependency3'], function (D1, D2, D3) {
    // Execute once D1, D2, D3 are resolved.
    return {
        // Return ns:module extension.
    };
});
```


## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [https://betajs.com](https://betajs.com) |
| Git        | [git://github.com/betajs/betajs-scoped.git](git://github.com/betajs/betajs-scoped.git) |
| Repository | [https://github.com/betajs/betajs-scoped](https://github.com/betajs/betajs-scoped) |
| Blog       | [https://blog.betajs.com](https://blog.betajs.com) | 
| Twitter    | [https://twitter.com/thebetajs](https://twitter.com/thebetajs) | 
| Gitter     | [https://gitter.im/betajs/betajs-scoped](https://gitter.im/betajs/betajs-scoped) | 



## Compatability
| Target | Versions |
| :----- | -------: |
| Firefox | 3 - Latest |
| Chrome | 18 - Latest |
| Safari | 4 - Latest |
| Opera | 12 - Latest |
| Internet Explorer | 6 - Latest |
| Edge | 12 - Latest |
| Yandex | Latest |
| iOS | 3.0 - Latest |
| Android | 4.4 - Latest |
| NodeJS | 4.0 - Latest |


## CDN
| Resource | URL |
| :----- | -------: |
| scoped.js | [http://cdn.rawgit.com/betajs/betajs-scoped/master/dist/scoped.js](http://cdn.rawgit.com/betajs/betajs-scoped/master/dist/scoped.js) |
| scoped.min.js | [http://cdn.rawgit.com/betajs/betajs-scoped/master/dist/scoped.min.js](http://cdn.rawgit.com/betajs/betajs-scoped/master/dist/scoped.min.js) |


## Unit Tests
| Resource | URL |
| :----- | -------: |
| Test Suite | [Run](http://rawgit.com/betajs/betajs-scoped/master/tests/tests.html) |



## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-shims | [Open](https://github.com/betajs/betajs-shims) |


## Main Contributors

- Oliver Friedmann

## License

Apache-2.0






## Sponsors

- Ziggeo
- Browserstack


