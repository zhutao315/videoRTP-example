const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { Readable, Duplex } = require('stream');

const createFile = (string, name, cb) => {
  fs.writeFile(`public/video/${name}.webm`, Buffer.from(string), { 'flag': 'a' }, function(err) {
    if (err) {
        throw err;
    }
    cb && cb()
  })
}

function delDir(path, rmdir = true){
  let files = [];
  if(fs.existsSync(path)){
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()){
              delDir(curPath); //递归删除文件夹
          } else {
              fs.unlinkSync(curPath); //删除文件
          }
      });
      rmdir && fs.rmdirSync(path);
  }
}

function SendVideo(readStream) {
  return new Promise((resolve, reject) => {
    var proc = new ffmpeg(readStream) 
        .withFps(5)
        .addOptions([
          "-vcodec libx264",
          "-preset veryfast",
          "-acodec aac",
          "-pix_fmt yuv422p",
          "-maxrate 1000k",
          "-bufsize 3000k",
          "-acodec libmp3lame",
          '-f',
          'flv',
        ])
        .format("flv")
        .output('rtmp://localhost/live/video.flv', {  // http://localhost:8000/live/video.flv
          end: true
        })
        .on('end', function() {
          resolve()
        })
        .on('error', function(err) {
          console.log('ERR: ' + err.message)
          reject()
        })

        proc.run() // .pipe() 则不用手动run()
        //proc.setFfmpegPath(ffmpegPath)
  })
}

function convertToWebm() {
  let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
  new ffmpeg('public/uploads/%d.webp')
      .withFps(5)
      .on('end', function() {
        delDir('public/uploads', false)
      })
      .on('error', function(err) {
        console.log('ERR: ' + err.message)
        delDir('public/uploads', false)
      })
      .saveToFile('public/video/' + timeStamp + '.webm') // 可以mp4

      //proc.setFfmpegPath(ffmpegPath)
}

function handleWebp(ws) {
  let pic = 1;
  ws.on('message', function incoming(message) {
    if (message !== '0') {
      fs.writeFileSync(`public/uploads/${pic}.webp`, Buffer.from(message))
      pic ++ ;
    } else {
      convertToWebm()
    }
  })
}

module.exports = wss => {
  wss.on('connection', function connection(ws, req) {
    console.log('connection', req.url)
    if (req.url === '/webp') {
      return handleWebp(ws)
    }
      let i = 0, j = 0, isPause = false;
      let rs1 = new Readable()
      rs1._read = function() {
        if (j > i) {
          this.pause()
          isPause = true
        }else {
          if (isPause) {
            this.resume()
            isPause = false
          }
          j ++
        } 
      }
      SendVideo(rs1)
      ws.on('message', function incoming(message) {
        // 视频实时推流到前端
        rs1.push(message)
        i ++
        // 保存视频文件
        createFile(message, 'video')
      });
      // ws.send('something');
  });
}