const router = require('koa-router')()
const Koa = require('koa')

const fs = require('fs');

var stream = require('stream');

var toStream = require('blob-to-stream')

// 创建一个bufferstream
var bufferStream = new stream.PassThrough();
//将Buffer写入
//bufferStream.end(new Buffer('Test data.'));

const ffmpeg = require('fluent-ffmpeg');

function toVideo() {
  return new Promise((resolve, reject) => {
    let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
    var proc = new ffmpeg('public/uploads/%d.jpeg')
        .withFps(5)
        .on('end', function() {
          resolve()
        })
        .on('error', function(err) {
          console.log('ERR: ' + err.message)
          reject()
        })
        .saveToFile('public/video/' + timeStamp + '.mp4')

        //proc.setFfmpegPath(ffmpegPath)
  })
}


let str = ''


// module.exports = () => {
//   return router.all('/ws', async(ctx,next) => {
//     /**接收消息*/
//     ctx.websocket.on('message', async function (message) {
//       console.log('message', message)
//       str += message

//       bufferStream.end(new Buffer(str));

//         await toVideo(bufferStream)
//         ctx.websocket.send(message);
//     })
//   })
// }

function saveBlob(blob) {
  var reader = new FileReader()
  reader.onload = function(){
      var buffer = new Buffer(reader.result)
      //temp文件夹应已存在
      fs.writeFile(`public/uploads/1.jpeg`, buffer, {}, (err, res) => {
          if(err){
              console.error(err)
              return
          }
          console.log('video saved')
      })
  }
  reader.readAsArrayBuffer(blob)
}

let pic = 1;
function saveFile(buffer) {
    //过滤data:URL
    // var base64Data = buffer.replace(/^data:image\/\w+;base64,/, "");
    // var dataBuffer = new Buffer(base64Data, 'base64');
    // fs.writeFileSync('public/video/1.jpg', dataBuffer)
  
  fs.writeFileSync(`public/uploads/${pic}.jpeg`, Buffer.from(buffer))
  pic ++ ;

  //fs.writeFileSync('public/video/1.jpg', base64ToArrayBuffer(buffer))
}

//将base64 字符串转化为 arrayBuffer  buffer实例本质也是 Uint8Array实例 
function base64ToArrayBuffer(base64) {
  let base64Str = base64.replace(/^data:image\/\w+;base64,/, "")
  var dataBuffer = new Buffer(base64Str, 'base64');
  console.log('base----', new Uint8Array(dataBuffer)[0])
  return  new Uint8Array(dataBuffer)
}

function toBuffer(ab) {
  var buf = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}

module.exports = (ctx) => {
  ctx.websocket.binaryType="arraybuffer";
  ctx.websocket.on('message', async function (message) {
          console.log(message.byteLength || message, new Uint8Array(message)[0])
          
          try {
            message == 0 ? await toVideo() : saveFile(message)
          }catch(e){console.log('error:', e)}


          // str += message

          // // let buffer = Buffer.from(message);
          // // message = Uint8Array.from(buffer).buffer;
          // // console.log('buffer', message)
          // toStream(message).pipe((stream) => {
          //   console.log('stream', stream)
          //   toVideo(stream)
          // })
          //bufferStream.end(new Buffer(str));
          
            //ctx.websocket.send(message);
        })
}