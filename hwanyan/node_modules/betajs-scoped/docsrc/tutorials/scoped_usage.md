The Scoped system allows you to handle multiple libraries with separate namespaces and scopes.

Scopes in the Scoped system are organized in a tree structure.

Subscopes of a given scope inherit all namespacing definitions.

Given a scope, you can access the following different main pre-defined namespaces: 
- ``global``: this is the globally accessible namespace in JavaScript; in the browser, this would be ``window``
- ``root``: the root namespace of the scope in the scope tree
- ``local``: the namespace local to the current scope
- ``default``: a namespace completely private to the current scope
- ``parent``: the local namespace of the parent scope

Namespace declarations are always given in the following notation: ``parent:path`` where ``parent`` is an existing namespace declaration and ``path`` is an object path identifier like ``Main.Sub.Subsub``.

A globally registered ``jQuery`` would therefore be accessible via ``global:jQuery``.

You can also register new namespace for your own use:

``Scoped.binding("my_namespace", "parent:path")``

You can then use ``my_namepace`` the same way you use the pre-defined namespaces.

In order to define a subscope, you'd write:

``var MyScoped = Scoped.subScope();``

A typical blueprint to structure your own library using Scoped is this:

```javascript

(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:MyLibrary");
Scoped.binding("dependency1", "global:ExternalDependency1");
Scoped.binding("dependency2", "global:ExternalDependency2");

// Library code

}).call(Scoped);

```

This closure blueprint makes sure not to clutter the namespace of the rest of the environment.

One of the benefits of the Scoped system is that you can allow libraries to access external dependencies with different names and even overwrite the namespaces a library attaches to, so you can include two different versions of the same library without clashing their namespaces.

If you want a library to use or attach to different namespaces then its default ones, you need to overwrite them as follows before including the library:

```javascript
	Scoped.nextScope().binding("module", "global:MyLibraryAlternateNS", {
	    readonly: true
	});
```

Defining dependencies is based on three primitives:
- ``Scoped.require``: execute code once dependencies are resolved
- ``Scoped.define``: define a module in a namespace once dependencies are resolved
- ``Scoped.extend``: extend an existing module in a namespace once dependencies are resolved

The syntax is as follows:
```
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