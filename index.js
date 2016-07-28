// through2 是一个对 node 的 transform streams 简单封装
var through = require('through2');
var gutil = require('gulp-util');
var concat = require('concat-stream');

var PluginError = gutil.PluginError;

// 常量
const PLUGIN_NAME = 'gulp-repimageurl-css';

function replaceImageUrl(file,strContents,imageSuffix){
  var tmpCon = strContents;
  var fileFixList=["\.png","\.gif","\.jpg","\.jpeg","\.bmp"];
  for (var i=0;i<fileFixList.length;i++) {
    try {
      tmpCon = tmpCon.replace(new RegExp(fileFixList[i],"gim"),"_" + imageSuffix + fileFixList[i]);
    } catch (e) {
      throw new PluginError(PLUGIN_NAME, e.message);
    }
  }
  //console.log("con: "+tmpCon);

  file.contents = new Buffer(tmpCon);
  return file;
}

// 插件级别函数 (处理文件)
function gulpRepImageUrlCss(imageSuffix) {

  if (!imageSuffix) {
    throw new PluginError(PLUGIN_NAME, 'Missing imageSuffix text!');
  }

  // 创建一个让每个文件通过的 stream 通道
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // 返回空文件
      cb(null, file);
    }else if (file.isBuffer()) {
      try {
        file = replaceImageUrl(file, String(file.contents),imageSuffix);
        cb(null, file);
      } catch (e) {
        cb(new PluginError(PLUGIN_NAME, e.message));
      }
    }else if (file.isStream()) {
      file.contents.pipe(concat(function(data) {
          try {
            data = replaceImageUrl(file, String(data),imageSuffix);
            cb(null, data);
          } catch (e) {
            cb(new PluginError(PLUGIN_NAME, e.message));
          }
        }));
    }

  });

};

module.exports = gulpRepImageUrlCss;
