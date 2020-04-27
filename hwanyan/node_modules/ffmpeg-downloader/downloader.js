const fs = require('fs-extra')
const o = require('os')
const path = require('path')
const request = require('request')
const ProgressBar = require('progress')
const decompress = require('decompress')
const platform = process.platform == 'android' ? 'linux' : process.platform // Termux fix
// platform = process.platform === 'linux' && o.release().match(/^2./) ? 'linux2' : platform // OpenVZ kernels
const { execFile } = require('child_process')

/**
 * Downloads the FFMPEG binary.
 * @param {string} os - Target OS
 * @param {string} arch - Target architecture
 * @return {Promise<string>} - Output of ffmpeg -version
 */
function updateBinary (os = platform, arch = process.arch) {
  return new Promise((resolve, reject) => {
    if (platform === 'freebsd') return resolve(`
There are no static ffmpeg builds for FreeBSD currently available.
The module will try to use the system-wide installation.

Install it by running "pkg install ffmpeg" or via ports.
`)
    if (platform === 'openbsd') return resolve(`
There are no static ffmpeg builds for OpenBSD currently available.
The module will try to use the system-wide installation.

Install it by running "pkg_add ffmpeg" or via ports.
`) 
    const dir = `bin/${os}/${arch}`
    const bin = `${dir}/ffmpeg${os === 'win32' ? '.exe' : ''}`
    const dest = path.join(__dirname, bin)
    const fname = `${os}-${arch}.tar.bz2`
    const tmp = path.join(__dirname, 'bin', fname)
    try { fs.mkdirSync(path.join(__dirname, 'bin')) } catch(e) {}
    let bar

	// Cleanup directory
	fs.emptyDirSync('bin')

    // Get the latest version
    const req = request.get(`https://github.com/FocaBot/ffmpeg-downloader/raw/master/bin/${fname}`)
    req.on('error', e => reject(e)) // Handle errors
    .on('data', c => {
      bar = bar || new ProgressBar(`${fname} [:bar] :percent (ETA: :etas)`, {
        complete: '=',
        incomplete: ' ',
        width: 25,
        total: parseInt(req.response.headers['content-length'])
      })

      bar.tick(c.length)
    })
    .on('end', () => setTimeout(() => {
      bar.tick(bar.total - bar.curr)
      console.log('Decompressing...')
      decompress(tmp, path.join(__dirname, 'bin')).then(f => {
        fs.unlinkSync(tmp)
        // Try to get the version number
        // Skip this if not the same arch/os as what launched it
        if (os === platform && arch === process.arch) {
          execFile(dest, ['-version'], (error, stdout, stderr) => {
            if (error || stderr.length) return reject(error || stderr)
            resolve(stdout)
          })
        } else {
          resolve('Platform and arch are different than this system, cannot display ffmpeg version') 
        }
      })
    }, 1000))
    .pipe(fs.createWriteStream(tmp, { mode: 0o755 }))
  })
}

if (require.main === module) {
  // CLI
  const targetOS = process.argv[2] || platform
  const targetArch = process.argv[3] || process.arch
  console.log(`Downloading ffmpeg ${targetOS} ${targetArch}...`)
  updateBinary(targetOS, targetArch).then(version => {
    console.log(version)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
} else {
  // Module
  module.exports = updateBinary
}
