require('dotenv').config()
var request = require('request');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var static = require('node-static');
var express = require('express');
// var cognitiveServices = require('cognitive-services');
//https://www.npmjs.com/package/cognitive-services
var app = express();

var dir = path.join(__dirname, 'public');

app.use(express.static(dir));

app.listen(3000, function() {
    console.log('Listening on http://localhost:3000/');

    app.get('/', function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    });

    app.post('/fileupload', function(req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            console.log(files);
            var oldpath = files.filetoupload.path;
            var newpath = __dirname + '/public/' + files.filetoupload.name;
            fs.rename(oldpath, newpath, function(err) {
                if (err) throw err;
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                res.write('<img src="' + files.filetoupload.name + '"/>');

                res.end();


                var formData = {
                    // Pass data via Streams 
                    my_file: fs.createReadStream(newpath),
                };


                request.post(
                    'https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories&language=en',

                    // body: {'files':'http://localhost:3000/'+ files.filetoupload.name}, 
                    {
                        headers: {
                            'Host': 'westeurope.api.cognitive.microsoft.com',
                            'Content-Type': 'application/json',
                            'Ocp-Apim-Subscription-Key': process.env.API_KEY
                        },
                        formData: formData
                    },

                    function(error, response, body) {
                        console.log(response);
                        if (!error && response.statusCode == 200) {
                            console.log(body.categories);
                        }
                    }

                );



            });
        });
    });
});