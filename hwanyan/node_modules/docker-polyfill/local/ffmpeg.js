#!/usr/local/bin/node

const Runner = require(__dirname + "/../src/runner.js");
const local = JSON.parse(require('fs').readFileSync(__dirname + '/config.json'));

Runner.pipeProcesses(Runner.dockerRun({
    container: "jrottenberg/ffmpeg",
    argv: Array.prototype.slice.call(process.argv, 2),
    proxy: local.proxy,
    replaceArguments: {
        "libfaac": "libfdk_aac",
        "^/var": "/private/var"
    },
    preprocessFiles: {
        chown: local.preprocess_user,
        chmod: 666,
        mkdirs: true
    },
    postprocessFiles: {
        chown: local.postprocess_user,
        chmod: 666,
        recoverChown: true,
        recoverChmod: true
    }
}), process);
