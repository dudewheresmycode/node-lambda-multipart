var Pez = require('pez');

var CONTENT_TYPE_RE = /^multipart\/(?:form-data|related)(?:;|$)/i;
var CONTENT_TYPE_PARAM_RE = /;\s*([^=]+)=(?:"([^"]+)"|([^;]+))/gi;

function multipart(event, callback){
  var that = this;
  that.contentType = event.headers['content-type'];
  if(!that.contentType){ that.contentType = event.headers['Content-Type']; }
  const dispenser = new Pez.Dispenser({ boundary: that.getBoundry(that.contentType) });
  that.fields = {};
  that.files = [];
  dispenser.on('part', (part) => {
    that.files.push(part);
  });
  dispenser.on('field', (name, value) => {
    that.fields[name]=value;
  });
  dispenser.on('error',function(e){
    callback(e);
  });
  dispenser.on('close',function(){
    callback(null, {files:that.files, fields:that.fields});
  });
  dispenser.write(event.body, event.isBase64Encoded ? "base64" : "binary");
  dispenser.end();
}

multipart.prototype.getBoundry = function(contentType){
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

module.exports = multipart;
