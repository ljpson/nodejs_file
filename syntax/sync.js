var fs = require('fs');

fs.readFileSync('syntax/sample.txt','utf8', function(err,result){
  console.log(result);
});
