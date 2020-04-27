const o = require('os')
const platform = process.platform == 'android' ? 'linux' : process.platform // Termux fix
const unsupportedPlatforms = [
  'freebsd',
  'openbsd'
]
const isUnsupported = (plat) => unsupportedPlatforms.indexOf(plat) >= 0

const dir = `bin/${platform}/${process.arch}`
const bin = `${dir}/ffmpeg${platform === 'win32' ? '.exe' : ''}`
const probeBin = `${dir}/ffprobe${platform === 'win32' ? '.exe' : ''}`
const path = require('path')

module.exports = {
  download: require('./downloader'),
  path: isUnsupported(platform) ? '/usr/local/bin/ffmpeg' : path.join(__dirname, bin),
  probePath: isUnsupported(platform) ? '/usr/local/bin/ffprobe' : path.join(__dirname, probeBin)
}
