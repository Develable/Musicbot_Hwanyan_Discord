#!/usr/bin/node

const Runner = require(__dirname + "/../src/runner.js");

Runner.pipeProcesses(Runner.dockerRun({
    container: "jrottenberg/ffmpeg",
    command: "ffprobe",
    argv: Array.prototype.slice.call(process.argv, 2)
}), process);