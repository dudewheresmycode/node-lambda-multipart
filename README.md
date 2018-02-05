# lambda-multipart

A simple multipart/form-data parser for AWS lambda functions.

```
npm install -S lambda-multipart
```

```js
exports.handler = function(event, context, callback){
  var Multipart = require('lambda-multipart');
  var parser = new Multipart(event);
  parser.on('file',function(file){
    //file.headers['content-type']
    file.pipe(fs.createWriteStream(__dirname+"/downloads/"+file.filename));
  });
  parser.on('finish',function(result){
    //result.files (array of file streams)
    //result.fields (object of field key/values)
    console.log("Finished")
  });
}
```

### Thanks
@hapijs for https://github.com/hapijs/pez
