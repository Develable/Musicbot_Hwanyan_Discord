#!/usr/bin/node

const Runner = require(__dirname + "/../src/runner.js");

Runner.pipeProcesses(Runner.dockerRun({
    container: "jrottenberg/ffmpeg",
    argv: Array.prototype.slice.call(process.argv, 2),
    replaceArguments: {
        "libfaac": "libfdk_aac"
    }
}), process);
