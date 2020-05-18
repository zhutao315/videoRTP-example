const Koa = require('koa')
// const websockify = require('koa-websocket');
// const app = websockify(new Koa());
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
//const bodyparser = require('koa-bodyparser')

const logger = require('koa-logger')
var cors = require('koa2-cors');

// middlewares
// app.use(bodyparser())

// app.use(koaBody({
//   multipart:true, // 支持文件上传
//   formidable:{

//     maxFieldsSize:10*1024*1024,

//     multipart:true

// }
// }));

const index = require('./routes/index')
//const users = require('./routes/users')
// const websock = require('./routes/websock')

// error handler
onerror(app)

app.use(cors());




app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})



// routes
app.use(index.routes(), index.allowedMethods())
//app.use(users.routes(), users.allowedMethods())





// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
