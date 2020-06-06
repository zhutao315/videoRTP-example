const router = require("koa-router")();

var ffmpeg = require('fluent-ffmpeg')
var fs = require('fs')
var path = require('path')

var resolve = file => path.resolve(__dirname, file)

var middle = (req, cb) => {
    if (req.is('text/*')) {
        req.text = ''
        req.setEncoding('utf8')
        req.on('data', function(chunk){ req.text += chunk })
        req.on('end', cb)
    }
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
    var response = {}
  
    if (matches.length !== 3) {
      return new Error('Invalid input string')
    }
  
    response.type = matches[1]
    response.data = new Buffer(matches[2], 'base64')
  
    return response
}

function imgToVideo(req, res) {
    var imgs = req.text.split(' ')
    var timeStamp = Date.now()
    var folder = 'images/' + timeStamp
    if (!fs.existsSync(resolve(folder))){
      fs.mkdirSync(resolve(folder));
    }
  
    Promise.all(imgs.map(function (value, index) {
      var img = decodeBase64Image(value)
      var data = img.data
      var type = img.type
      return new Promise(function (resolve, reject) {
        fs.writeFile(path.resolve(__dirname, (folder + '/img' + index + '.' + type)), data, 'base64', function(err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })).then(function () {
      var proc = new ffmpeg({ source: resolve(folder + '/img%d.png'), nolog: true })
        .withFps(25)
        .on('end', function() {
          res.status(200)
          res.send({
            url: '/video/mpeg/' + timeStamp,
            filename: 'jianshi' + timeStamp + '.mpeg'
          })
        })
        .on('error', function(err) {
          console.log('ERR: ' + err.message)
          res.status(500)
        })
        .saveToFile(resolve('video/jianshi' + timeStamp + '.mpeg'))
    })
}
  
  router.post('/video/record', function(req, res) {
    middle(req, () => {
        imgToVideo(req, res)
    })
  })
  
  router.get('/video/mpeg/:timeStamp', function(req, res) {
    res.contentType('mpeg');
    var rstream = fs.createReadStream(resolve('video/jianshi' + req.params.timeStamp + '.mpeg'));
    rstream.pipe(res, {end: true});
  })


  /**前端代码
   * 
   * generatePng () {
        ...
        var imgData = canvas.toDataURL("image/png");
        return imgData;
     }

     imgs.push(this.generatePng());
    $.ajax({
      url: '/video/record',
      data: imgs.join(' '),
      method: 'POST',
      contentType: 'text/plain',
      success: function (data, textStatus, jqXHR) {
        resolve(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        reject(errorThrown);
      }
    });
   * 
   * 
   */