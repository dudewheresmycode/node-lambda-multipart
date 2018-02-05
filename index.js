var Pez = require('pez');
var events = require("events");
var util = require("util");

var CONTENT_TYPE_RE = /^multipart\/(?:form-data|related)(?:;|$)/i;
var CONTENT_TYPE_PARAM_RE = /;\s*([^=]+)=(?:"([^"]+)"|([^;]+))/gi;

function multipart(event){
  var that = this;
  events.EventEmitter.call(this);
  that.contentType = event.headers['content-type'];
  if(!that.contentType){ that.contentType = event.headers['Content-Type']; }
  const dispenser = new Pez.Dispenser({ boundary: that.getBoundary(that.contentType) });
  that.fields = {};
  that.files = [];
  dispenser.on('part', (part) => {
    that.files.push(part);
    that.emit('file', part)
  });
  dispenser.on('field', (name, value) => {
    that.fields[name]=value;
    that.emit('field', that.fields[name])
  });
  dispenser.on('error',function(e){
    that.emit('error', {error:e})
  });
  dispenser.on('close',function(){
    //callback(null, {files:that.files, fields:that.fields});
    that.emit('finish', {files:that.files, fields:that.fields})
  });
  dispenser.write(event.body, event.isBase64Encoded ? "base64" : "binary");
  dispenser.end();
}

multipart.prototype.getBoundary = function(contentType){
  var m = CONTENT_TYPE_RE.exec(contentType);
  if (!m) {
    callback(null, {statusCode: 415, body: "unsupported content-type", headers: {"Content-Type":"text/plain"}});
    console.log('unsupported content-type');
    return;
  }

  var boundary;
  CONTENT_TYPE_PARAM_RE.lastIndex = m.index + m[0].length - 1;
  while ((m = CONTENT_TYPE_PARAM_RE.exec(contentType))) {
    if (m[1].toLowerCase() !== 'boundary') continue;
    boundary = m[2] || m[3];
    break;
  }
  return boundary;
}

util.inherits(multipart, events.EventEmitter);

module.exports = multipart;
