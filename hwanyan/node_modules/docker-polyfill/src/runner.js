const Client = require(__dirname + "/client.js");
const Files = require(__dirname + "/files.js");
const ChildProcess = require("child_process");


module.exports = {

    polyfillRun: function (options) {
        if (options.docker && typeof options.docker === "string")
            options.docker = {container: options.docker};
        var process;
        if (options.docker) {
            options.docker.command = options.command;
            options.docker.argv = options.argv;
            process = this.dockerRun(options.docker);
        } else
            process = this.nodockerRun(options);
        if (options.timeout) {
            var timer = setTimeout(function () {
                process.emit("timeout");
                process.kill();
            }, options.timeout);
            process.on("close", function () {
                clearTimeout(timer);
            });
        }
        return process;
    },

    nodockerRun: function (options) {
        return ChildProcess.spawn(options.command, options.argv);
    },

    dockerRun: function (options) {
        return options.proxy ? this.clientRun(options) : this.localRun(options);
    },

    clientRun: function (options) {
        return Client.run(options.proxy, options);
    },

    localRun: function (options) {
        options.preprocessFiles = options.preprocessFiles || {};
        options.postprocessFiles = options.postprocessFiles || {};
        const container = options.container;
        // command can be undefined
        const command = options.command;
        var argv = options.argv || [];
        // replace arguments with replacement hash
        if (options.replaceArguments) {
            argv = argv.map(function (arg) {
                for (var replaceFrom in options.replaceArguments) {
                    var replaceTo = options.replaceArguments[replaceFrom];
                    arg = arg.replace(new RegExp(replaceFrom, "g"), replaceTo);
                }
                return arg;
            });
        }
        // extract all file names
        const files = Files.extractFiles(argv);
        // analyze files
        const analyzedFiles = Files.analyzeFiles(files);
        const fileMounts = analyzedFiles.mounts;
        const fileMappings = analyzedFiles.mappings;
        // replace files in arguments
        argv = Files.replaceFiles(argv, fileMappings);
        // generate docker mount parameters
        const mountParameters = Files.generateMountParameters(fileMounts);
        // generate command line
        var dockerArgs = ["run", "--rm"];
        dockerArgs = dockerArgs.concat(mountParameters);
        if (command) {
            dockerArgs.push("--entrypoint");
            dockerArgs.push(command);
        }
        dockerArgs.push(container);
        dockerArgs = dockerArgs.concat(argv);
        // not sure why
        dockerArgs = dockerArgs.join(" ").split(" ");
        // Adjust file permissions and ownership
        var oldChown, oldMods;
        if (options.preprocessFiles.mkdirs) {
            Files.ensureOriginalDirectoryExistence(fileMappings);
        }
        if (options.preprocessFiles.chown) {
            if (options.postprocessFiles.recoverChown)
                oldChown = Files.extractOwns(fileMappings);
            Files.changeOwns(fileMappings, options.preprocessFiles.chown);
        }
        if (options.preprocessFiles.chmod) {
            if (options.postprocessFiles.recoverChmod)
                oldMods = Files.extractMods(fileMappings);
            Files.changeMods(fileMappings, options.preprocessFiles.chmod);
        }
        // Start docker
        var docker = ChildProcess.spawn("docker", dockerArgs);
        docker.on("close", function () {
            // Postprocess Ownership
            if (options.postprocessFiles.chown)
                Files.changeOwns(fileMappings, options.postprocessFiles.chown);
            if (options.postprocessFiles.chmod)
                Files.changeMods(fileMappings, options.postprocessFiles.chmod);
            if (oldChown)
                Files.restoreOwns(oldChown);
            if (oldMods)
                Files.restoreMods(oldMods);
        });
        return docker;
    },

    pipeProcesses: function (source, target) {
        source.stderr.pipe(target.stderr);
        source.stdout.pipe(target.stdout);
        target.stdin.pipe(source.stdin);
        target.stdin.on("end", function () {
            source.stdin.emit("end");
        });
        source.on("close", function (status) {
            target.exit(status);
        });
    }

};
