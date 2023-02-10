var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;


  if(pathname === '/'){
      if (queryData.id === undefined){
        fs.readdir('./data', 'utf8', function(error, filelist){
            title = 'Welcome';
            description = 'Hello World';
            var list = template.list(filelist);
            var html = template.html(title,list,
              `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a> `);
            response.writeHead(200);
            response.end(html);
        });
      } else {
        fs.readdir('./data', 'utf8', function(error, filelist){
          fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
            var title = queryData.id;
            var sanitizeTitle = sanitizeHtml(title);
            var sanitizeDescription = sanitizeHtml(description);
            var list = template.list(filelist);
            var html = template.html(title,list,
              `<h2>${sanitizeTitle}</h2>${sanitizeDescription}`,
              `<a href="/create">create</a>
              <a href="/update?id=${sanitizeTitle}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizeTitle}">
                <input type="submit" value="delete">
              </form>`);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
  } else if(pathname === '/create'){
    fs.readdir('./data', 'utf8', function(error, filelist){
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.html(title,list, `
        <form action="http://localhost:3000/create_process" method="POST">
          <p><input type="text" name="title" placeholder="title">
          <p>
              <textarea name="description" rows="8" cols="80" placeholder="description"></textarea>
          </p>
          <p>
              <input type="submit">
          </p>
        </form>
        `, '');
      response.writeHead(200);
      response.end(html);
    })
  } else if(pathname === '/create_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      console.log(post);
      console.log(title+"/"+description);
      fs.writeFile(`data/${title}`,description,'utf8',function(err){
        response.writeHead(302, {Location: `/?id=${title}`}); //페이지를 리다이렉션
        response.end();
      });
    })
  } else if(pathname === '/update'){
    fs.readdir('./data', 'utf8', function(error, filelist){
      fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.html(title,list, `
          <form action="http://localhost:3000/update_process" method="POST">
          <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}">
            <p>
                <textarea name="description" rows="8" cols="80" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
          </form>
          `, ``
        );

      response.writeHead(200);
      response.end(html);
      });
    });
  } else if(pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      console.log(post);

       fs.rename(`data/${id}`,`data/${title}`,function(err){
         fs.writeFile(`data/${title}`,description,'utf8',function(err){
           response.writeHead(302, {Location: `/?id=${title}`}); //페이지를 리다이렉션
           response.end();
         });
       });
    })
  } else if(pathname === '/delete_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function(error){
        response.writeHead(302, {Location: `/`}); //페이지를 리다이렉션
        response.end();
      })
    })

  } else{
    response.writeHead(404);
    response.end('Not found');
  }

});
app.listen(3000);
