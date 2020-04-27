You can use the Scoped system to pre-compile libraries based on Scoped in order to only include required sub modules.

The grunt configuration looks as follows:

```js
grunt.initConfig({
  scoped: {
      dist: {
          dest: "compiled.js",
          externals: ["namespace1", "namespace2"],
          src: [{
          	   src: "source1.js",
          	   bindings: {
          	   	   "binding1": "namespace1",
          	   	   "binding2": "namespace2"
          	   },
          	   full: false,
          	   require: ["namespaceX", "namespaceY"]
          }, {
            ...
          }]
      }
  }
});

grunt.loadNpmTasks('betajs-scoped');
``` 
