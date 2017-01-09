'use strict';

var form = document.forms.namedItem('fileinfo');
form.addEventListener('submit', function(ev) {

  var oOutput = document.getElementById('message');
  var files = document.getElementById('up').files;
  var count = files.length;
  var error = '';

  if (count < 1) {
    error = 'Error: Need some files';
  }

  var oData = new FormData();
  for (var i = 0; i < count; i++) {
    if ((files[i].type !== 'application/x-zip-compressed') && (files[i].type !== 'application/zip')) {
      error = 'Error: Need zip files, not type ' + files[i].type +'.';
    } else {
      oData.append('zips', files[i]);
    }
  }

  if (error) {
    oOutput.textContent = error;
  } else {
    // oData.append('CustomField', 'This is some extra data');
    var oReq = new XMLHttpRequest();
    oReq.open('POST', 'http://api.ahcsdev.ibx.com/claimweb/uploader', true);
    oReq.onload = function(oEvent) {
      if (oReq.status === 200) {
        var res = JSON.parse(oReq.responseText); //make responseText string into an object
        console.log('res whole: ',res);
        var splash = '<ol>';
        // for loop works in all browsers, unlink foreach which does not work in firefox. reason unknown.
        for (var j = 0; j < res.length; j++) {
          splash += '<li>' + res[j].originalname + '</li>';
        }     
        splash += '</ol>';

        if(res.error) {
          oOutput.textContent = 'Error: ' + res.error;
        } else {
          oOutput.innerHTML = 'Uploaded:<br> ' + splash;
        }
      } else {
        oOutput.textContent = 'Error: ' + oReq.statusText + ' status returned when trying to upload your file.';
      }
    };
    oReq.send(oData);
    oOutput.textContent = '';
  }
  ev.preventDefault();
}, false);