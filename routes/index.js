const router = require("koa-router")();
const ffmpeg = require('fluent-ffmpeg');
const koaBody = require('koa-body');
var fs = require('fs')
var path = require('path')
const getUploadFileExt = require('../public/javascripts/utils/getUploadFileExt')
const checkDirExist = require('../public/javascripts/utils/checkDirExist')


const config = {
  multipart:true,
  encoding:'gzip',
  formidable:{
    uploadDir:path.join(__dirname,'public/uploads'),
    keepExtensions: true,
    maxFieldsSize:2 * 1024 * 1024,
    onFileBegin:(name,file) => {
      // 获取文件后缀
      const ext = getUploadFileExt(file.name);
      // 最终要保存到的文件夹目录
      const dir = path.join(__dirname,`../public/uploads`);
      // 检查文件夹是否存在如果不存在则新建文件夹
      checkDirExist(dir);
      // 重新覆盖 file.path 属性
      file.path = `${dir}/${file.name}`;
      // console.log(file.path)
    },
    onError:(err)=>{
      console.log(err);
    }
  }
}


function emptyFold(path) {
  var files = fs.readdirSync(path);
  files.forEach(file => {
    fs.unlinkSync(path+'/'+file);
  })
}

function toVideo() {
  return new Promise((resolve, reject) => {

    let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
    var proc = new ffmpeg('public/uploads/%d.webp')
        .withFps(5)
        .on('end', function() {
          resolve()
          emptyFold('public/uploads')
        })
        .on('error', function(err) {
          console.log('ERR: ' + err.message)
          emptyFold('public/uploads')
          reject()
        })
        .saveToFile('public/video/' + timeStamp + '.mp4')

        //proc.setFfmpegPath(ffmpegPath)
  })
}

let filePaths = []
// 上传服务器，生成视频文件
router.post('/upload',koaBody(config), async(ctx)=>{
    // 请求的参数为
    console.log('ctx.req.body', ctx.request.body);

    if (ctx.request.body.total) {
      let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
      try {
        await toVideo()
      }catch(e) {
        emptyFold('public/uploads')
      }

      ctx.response.body = {
        url: '/video/' + timeStamp + '.mp4'
      }
    }
})

// 视频实时上传服务器，服务器实时推送直播到客户端
router.post('/uploadRtmp',koaBody(config), async(ctx)=>{
  // 请求的参数为
  console.log('ctx.req.body', ctx.request.body);

  if (ctx.request.body.total) {
    let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
    try {
      await toVideo()
    }catch(e) {
      emptyFold('public/uploads')
    }

    ctx.response.body = {
      url: '/video/' + timeStamp + '.mp4'
    }
  }
})


module.exports = router;
