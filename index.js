var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var static = require('node-static');
var express = require('express');

const Azure = require('azure');
const msRestAzure = require('ms-rest-azure');
const CognitiveServicesManagement = require("azure-arm-cognitiveservices");

// Interactive Login 
// It provides a url and code that needs to be copied and pasted in a browser and authenticated over there. If successful,  
// the user will get a DeviceTokenCredentials object. 
msRestAzure.loginWithServicePrincipalSecret(
  'a0923c32-1b7f-41bc-aea2-19cc2d81ec02',
  '8958a04d-2fe0-492b-9619-b0e2bf007e83',
  '213af4b4-a03f-4b00-8fc2-c192df40c613',
  (err, credentials) => {
    if (err) throw err

    let storageClient = Azure.createASMStoreManagementClient(credentials, '213af4b4-a03f-4b00-8fc2-c192df40c613');
    console.log(storageClient);
    // ..use the client instance to manage service resources.
  }
);


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
            });
        });
    });
});