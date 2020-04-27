Debugging Scoped-based programs normally boils down to understanding why some dependencies are not being resolved.

The main reason for unresolved dependencies are typos.

The Scoped system has support for telling you which dependencies are not met at a certain point, so you can backtrack the root cause of the problem.

At any time, you can call the method ``Scoped.unresolved(namespace)`` that will return an array of unresolved definitions within the given namespace.

For instance, if you want to know which definitions are unresolved in the globally accessible namespace, you would call ``Scoped.unresolved("global:")``.