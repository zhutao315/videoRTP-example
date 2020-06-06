const router = require("koa-router")();
const multer=require('koa-multer');
const ffmpeg = require('fluent-ffmpeg');
var fs = require('fs')
var path = require('path')



//var ffmpegPath = path.resolve(__dirname, 'ffmpeg/ffmpeg/bin/ffmpeg.exe')

//var resolve = file => path.resolve(__dirname, file)

//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: 'public/uploads',
  // function (req, file, cb) {
  //     cb(null, 'public/uploads/')
  // },
  //修改文件名称
  filename: function (req, file, cb) {
    console.log('file', file)
      var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
      cb(null,fileFormat[0] + "." + fileFormat[fileFormat.length - 1]);
      
  }
});

//加载配置
var upload = multer({ storage: storage });

//路由
router.post('/upload',upload.single('file'),async(ctx,next)=>{
    // 请求的参数为
    console.log('ctx.req.body',ctx.req.body.id );
 
    
    // 获取保存的路径
    // var path = ctx.req.file;

    let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()

    await toVideo()

    ctx.body = {
      url: '/video/' + timeStamp + '.mp4'
    }
})


router.all('/wx', function (ctx) {
  // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
  console.log('get wx')
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', function(message) {
    // do something with the message from client
        console.log(message);
  });
})


router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!"
  });
});

router.get("/string", async (ctx, next) => {
  ctx.body = "koa2 string";
});

router.get("/json", async (ctx, next) => {
  ctx.body = {
    title: "koa2 json"
  };
});


function toVideo() {
  return new Promise((resolve, reject) => {
    let timeStamp = new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
    var proc = new ffmpeg('public/uploads/%d.jpg')
      
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


module.exports = router;
