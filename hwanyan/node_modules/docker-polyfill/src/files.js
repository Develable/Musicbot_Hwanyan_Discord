const FilenameRegex = /([\.A-Za-z0-9-_]*\/[\.A-Za-z0-9-_\/]+)/g;
const FS = require("fs");
const Path = require("path");
const ChildProcess = require("child_process");

const chmod = function (mods, filename) {
    // console.log("chmod " + mods + " " + filename);
    ChildProcess.exec("chmod " + mods + " " + filename);
};

const chown = function (owner, filename) {
    // console.log("chown " + owner + " " + filename);
    ChildProcess.exec("chown " + owner + " " + filename);
};


module.exports = {

    extractFiles: function (args) {
        var files = {};
        args.forEach(function (arg) {
            while (match = FilenameRegex.exec(arg))
                files[match[1]] = true;
        });
        var result = [];
        for (var file in files)
            result.push(file);
        return result;
    },

    analyzeFiles: function (files) {
        var mountMap = {};
        files.forEach(function (filename) {
            const originalDirectory = Path.dirname(Path.resolve(filename));
            mountMap[originalDirectory] = originalDirectory;
        });
        for (var sub in mountMap)
            for (var root in mountMap)
                if (root.length < mountMap[sub].length && sub.indexOf(root) === 0 && sub.charAt(root.length) === "/")
                    mountMap[sub] = root;
        var mounts = {};
        var idx = 0;
        for (sub in mountMap) {
            root = mountMap[sub];
            if (mounts[root])
                continue;
            mounts[root] = "/dockermounts-" + idx;
            idx++;
        }
        var mappings = {};
        files.forEach(function (filename, index) {
            const originalFullName = Path.resolve(filename);
            const baseName = Path.basename(filename);
            const originalDirectory = Path.dirname(originalFullName);
            const exists = FS.existsSync(originalFullName);
            const dirExists = FS.existsSync(originalDirectory);
            const stats = exists ? FS.lstatSync(originalFullName) : {};
            const directoryStats = dirExists ? FS.lstatSync(originalDirectory) : {};
            const isFile = exists && stats.isFile();
            const isDirectory = exists && stats.isDirectory();
            const mountSource = mountMap[originalDirectory];
            const mountTarget = mounts[mountSource];
            const mountFullName = mountTarget + originalDirectory.substring(mountSource.length) + "/" + baseName;
            mappings[filename] = {
                index: index,
                originalName: filename,
                originalFullName: originalFullName,
                originalStats: stats,
                originalDirectoryStats: directoryStats,
                baseName: baseName,
                originalDirectory: originalDirectory,
                exists: exists,
                dirExists: dirExists,
                isFile: isFile,
                isDirectory: isDirectory,
                mountSource: mountSource,
                mountTarget: mountTarget,
                mountFullName: mountFullName
            };
            mounts[mountSource] = mountTarget;
        });
        return {
            mappings: mappings,
            mounts: mounts
        };
    },

    replaceFiles: function (args, files) {
        return args.map(function (arg) {
            var result = arg;
            for (var fileKey in files) {
                var file = files[fileKey];
                result = result.replace(file.originalName, file.mountFullName);
            }
            return result;
        });
    },

    generateMountParameters: function (mounts) {
        var result = [];
        for (var mountSource in mounts) {
            var mountTarget = mounts[mountSource];
            result.push("-v");
            result.push(mountSource + ":" + mountTarget + ":rw");
        }
        return result;
    },

    ensureOriginalDirectoryExistence: function (files) {
        for (var fileKey in files) {
            var file = files[fileKey];
            // console.log("Check", file);
            if (file.exists || file.dirExists)
                continue;
            // extract all directory tokens into array, reconstruct path and work our way through it
            var dirs = file.originalDirectory.split("/");
            var currentDir = "";
            dirs.forEach(function (dir) {
                currentDir += "/" + dir;
                if (!FS.existsSync(currentDir)) {
                    // console.log("Create Directory", currentDir);
                    FS.mkdirSync(currentDir);
                }
            });
        }
    },

    extractOwns: function (files) {
        var owns = {};
        for (var fileKey in files) {
            var file = files[fileKey];
            if (file.exists)
                owns[file.originalFullName] = file.originalStats.uid;
            owns[file.originalDirectory] = file.originalDirectoryStats.uid;
        }
        return owns;
    },

    extractMods: function (files) {
        var mods = {};
        for (var fileKey in files) {
            var file = files[fileKey];
            if (file.exists) {
                var m = file.originalStats.mode;
                var mode = ((m >> 6) & 7) * 100 + ((m >> 3) & 7) * 10 + ((m >> 0) & 7) * 1;
                mods[file.originalFullName] = mode;
            }
            /*
            var m = file.originalDirectoryStats.mode;
            var mode = ((m >> 6) & 7) * 100 + ((m >> 3) & 7) * 10 + ((m >> 0) & 7) * 1;
            mods[file.originalDirectory] = mode;*/
        }
        return mods;
    },

    restoreOwns: function (owns) {
        for (var fileName in owns) {
            chown(owns[fileName], fileName);
        }
    },

    restoreMods: function (mods) {
        for (var fileName in mods) {
            chmod(mods[fileName], fileName);
        }
    },

    changeOwns: function (files, owner) {
        for (var fileKey in files) {
            var file = files[fileKey];
            //if (file.exists)
                chown(owner, file.originalFullName);
            chown(owner, file.originalDirectory);
        }
    },

    changeMods: function (files, mods) {
        for (var fileKey in files) {
            var file = files[fileKey];
            //if (file.exists)
                chmod(mods, file.originalFullName);
            //chmod(mods, file.originalDirectory);
        }
    }

};