const Net = require('net');
const ChildProcess = require("child_process");
const Runner = require(__dirname + "/runner.js");

module.exports = {

    runServer: function (proxy) {
        const server = Net.createServer(function (socket) {
            socket.on('data', function (data) {
                try {
                    const parsed = JSON.parse(data);
                    const cmd = parsed.data;
                    const stdin = parsed.stdin;
                    console.log(cmd);
                    const file = Runner.localRun(cmd);
                    file.stdin.push(stdin);
                    file.stdin.push(null);
                    var stderr = "";
                    var stdout = "";
                    file.stderr.on("data", function (data) {
                        stderr += data.toString();
                    });
                    file.stdout.on("data", function (data) {
                        stdout += data.toString();
                    });
                    file.on("close", function (status) {
                        try {
                            const result = JSON.stringify({
                                status: status,
                                stderr: stderr,
                                stdout: stdout
                            });
                            console.log(result);
                            socket.end(result);
                        } catch (e) {
                            console.log(e);
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        });

        const components = proxy.split(":");
        server.listen(parseInt(components[1], 10), components[0]);

    }
};
