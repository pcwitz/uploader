var express = require('express');
var decompress = require('decompress');
var fs = require('fs');
var path = require('path');

var dirPath = '\\\\blah\\blah\\blah\\blah';
var tmp = 'tmp';

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, tmp);
  }
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname + '-' + Date.now() + '.zip');
  // }
  // could add filename function to storage if you care what the zip is named
});
var upload = multer({ storage: storage }).array('zips');

function prefixer() {
  var today = new Date();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  return 'A' + month + day;
}

function paddy(n, p, c) {
  var padchar = typeof c !== 'undefined' ? c : '0';
  var pad = new Array(1 + p).join(padchar);
  return (pad + n).slice(-pad.length);
}

function checkIfFile(file, cb) {
  fs.stat(file, function fsStat(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        return cb(null, false);
      } else {
        return cb(err);
      }
    }
    return cb(null, stats.isFile());
  });
}

// var upload = multer().array('zips');
var uploaderRouter = express.Router();
uploaderRouter.route('/')
  .post(function(req, res) {
    upload(req, res, function(err) {
      if (err) {
        res.json({ error: 'An error occurred when uploading: ' + err });
      } else {
        new Promise(function(outerResolve, outerReject) {

          fs.readdir(dirPath, function(err, list) {
            if (err) {
              res.json({ error: 'Cannot read the contents of the directory.'});
            }
            if (list.length === 0) {
              outerResolve(0);
            } else {
              var filePromises = [];
              list.forEach(function(f, i) {
                var promise = new Promise(function(resolve, reject) {
                  checkIfFile(dirPath + '\\' + f, function(err, isFile) {
                    resolve(isFile ? 1 : 0);
                  });
                }); 
                filePromises.push(promise);
              });

              Promise.all(filePromises)
              .then(function(successes) {
                var fileCount = 0;
                successes.forEach(function(i) {
                  fileCount += i;
                });
                outerResolve(fileCount);
                // the Promise resolves here and fileCount becomes input to the then resolve handler
              });
            }
          });
        })
        .then(function(fileCount) {
          // file name needs to be this format: A[mmdd][seq#] where seq must be a three digit number left-padded with 0s
          var prefix = prefixer();
          var zips = req.files; // files is array of files coming in
          i = fileCount + 1; // start naming files 1 above count of files presently in folder

          zips.forEach(function(zip) {
            // if ((zip.mimetype === 'application/x-zip-compressed') || (zip.mimetype === 'application/zip')) {
            decompress(zip.path, dirPath, {
              filter: function(file) {
                return file.path !== 'manifest.txt';
              },
              map: function(file) {
                var seq = paddy(i, 3); // 00i
                var ext = path.extname(file.path).toLowerCase();
                file.path = prefix + seq + ext;
                i = i + 1;
                return file;
              },
              strip: 1 // strip removes folder holding files after extraction and gives direct access to filename via file.path, since, file.path, without a path, is simply the filename
            });
            fs.unlink(zip.path);
            // }
          });
          res.json(zips);
        }); // also takes rejectionHandler, notificationHandler if necessary
      } // end error-free zip upload callback
    }); // end zip upload callback
  }); // end claimweb/uploader post request and response

module.exports = uploaderRouter;