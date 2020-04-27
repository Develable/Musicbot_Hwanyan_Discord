# ffmpeg-downloader

Dynamically downloads the FFMPEG static binaries.

Unlike other packages, this one detects the OS + architecture and
downloads only the required files.

## Supported Operating Systems

 - Windows
   - win32 ia32
   - win32 x64
 - Linux / Android
   - linux ia32 (i386)
   - linux x64 (x86_64)
   - linux arm (armel)
   - linux arm64 (aarch64)
 - macOS
   - darwin x64

## Usage

### As a module

ffmpeg-downloader downloads ffmpeg during `npm install`

```javascript
const ffmpegPath = require('ffmpeg-downloader').path
```

### Command-line

```
node downloader darwin x64
``` 

Even if you're on a windows platform, will download the OSX binary for fetching purposes. Useful for making builds of your app for different systems than the one you're on.
