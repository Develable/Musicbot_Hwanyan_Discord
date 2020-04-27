module.exports = function(grunt) {
	var Scoped = require(__dirname + "/../dist/scoped.js");
	Scoped.upgradable = false;
	var Path = require("path");

    var compileCounter = 0;
	
	grunt.registerMultiTask('scoped', 'Scoped compilation', function() {
		this.files.forEach(function (fileObj) {
            compileCounter++;
			var mapBinding = function (binding) {
				return binding.replace("global:", "global:Temp" + compileCounter + ".");
			};
			var sources = fileObj.orig.sources || fileObj.orig.src;
			var dest = fileObj.dest;
			var result = [];
			if (fileObj.orig.include_scoped)
				result.push(grunt.file.read(__dirname + "/../dist/scoped.js"));
			var subs = [];
			var externals = fileObj.externals || [];
			for (var j = 0; j < externals.length; ++j) {
				Scoped.define(externals[j], function () {
					return {};
				});
			}
			for (var i = 0; i < sources.length; ++i) {
				var sub = Scoped.nextScope();
				sub.assumeVersion = function () {};
				var current = sources[i];
				for (var bind in current.bindings || {})
					sub.binding(bind, mapBinding(current.bindings[bind]), { readonly: true });
				sub.options.compile = true;
				sub.options.lazy = !current.full;
                console.log("Scoped: Loading " + current.src);
                var oldScoped = Scoped;
                if (current.subScope)
                	global.Scoped = Scoped.subScope();
                try {
                	var resolvedPath = Path.resolve(current.src);
                	delete require.cache[resolvedPath];
                    require(resolvedPath);
                    delete require.cache[resolvedPath];
                } catch (e) {
                	console.log("Scoped: Error " + e);
				}
				if (current.subScope)
					global.Scoped = oldScoped;
				sub.require(current.require || []);
				subs.push(sub);
			}
			for (var i = 0; i < sources.length; ++i) {				
				var source = sources[i];
				if (source.hidden)
					continue;
				var sub = subs[i];
				result.push("(function () {");
				result.push("var Scoped = this.subScope();");
				for (var bind in source.bindings || {})
					result.push("Scoped.binding('" + bind + "', '" + source.bindings[bind] + "');");
				result.push(subs[i].compiled);
				result.push("}).call(Scoped);")
				
			}
			var unresolved = Scoped.unresolved("global:");
			if (unresolved.length > 0)
				console.warn("Unresolved", unresolved);
			grunt.file.write(dest, result.join("\n"));
		});
	});
	
	grunt.registerMultiTask('scoped-closure', 'closure', function() {
		this.files.forEach(function(fileGroup) {
			var result = [];
			if (fileGroup.banner)
				result.push(fileGroup.banner);
			result.push("(function () {");
			result.push("var Scoped = this.subScope();");
			for (var bind in fileGroup.bindings || {})
				result.push("Scoped.binding('" + bind + "', '" + fileGroup.bindings[bind] + "');");
			for (var define in fileGroup.defines || {}) {
				result.push('Scoped.define("' + define + '", function () {');
				result.push('	return ' + JSON.stringify(fileGroup.defines[define], null, 4) + ';');
				result.push('});');
			}
			for (var module in fileGroup.version_assumptions || {})
				result.push("Scoped.assumeVersion('" + module + "', '" + fileGroup.version_assumptions[module] + "');");
			
			if (fileGroup.exports) {
				result.push("Scoped.require(['" + fileGroup.exports + "'], function (mod) {");
				result.push("	this.exports(typeof module != 'undefined' ? module : null, mod);");
				result.push("}, this);");
			}

			var files = grunt.file.expand({nonull: true}, fileGroup.src);
			files.forEach(function (filepath) {
		        if (!grunt.file.exists(filepath)) {
		            grunt.log.error("Source file '" + filepath + "' not found.");
		            return "";
		        }
		        var src = grunt.file.read(filepath);
                if (typeof fileGroup.process === 'function')
                    src = fileGroup.process(src, filepath);
                else if (fileGroup.process)
                    src = grunt.template.process(src, fileGroup.process);
		        result.push(src);
			});
			
			result.push("}).call(Scoped);")
	        grunt.file.write(fileGroup.dest, result.join("\n"));			
		});
	});

};