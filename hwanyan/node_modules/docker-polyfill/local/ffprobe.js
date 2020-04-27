#!/usr/local/bin/node

const Runner = require(__dirname + "/../src/runner.js");
const local = JSON.parse(require('fs').readFileSync(__dirname + '/config.json'));

Runner.pipeProcesses(Runner.dockerRun({
    container: "jrottenberg/ffmpeg",
    command: "ffprobe",
    proxy: local.proxy,
    replaceArguments: {
        "^/var": "/private/var"
    },
    preprocessFiles: {
        chown: local.preprocess_user,
        chmod: 666
    },
    postprocessFiles: {
        chown: local.postprocess_user,
        chmod: 666,
        recoverChown: true,
        recoverChmod: true
    },
    argv: Array.prototype.slice.call(process.argv, 2)
}), process);