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