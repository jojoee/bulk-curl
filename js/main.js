
(function() {
  'use strict';

  /*================================================================ GLOBAL
  */

  var appDomain = 'jblunkcurl';
  var $urlList = document.getElementById('url-list');
  var $outputBody = document.getElementById('output-body');
  var $lunch = document.getElementById('lunch');
  var urlListKey = 'urllist';
  var i = 0;

  function saveLocal(key, val, cb) {
    console.log('saveLocal');
    var localKey = appDomain + key;

    localforage.setItem(localKey, val).then(function() {
      console.log('saveLocal - then');
      cb();
    });
  }

  function getLocal(key, cb) {
    console.log('getLocal');
    var localKey = appDomain + key;

    localforage.getItem(localKey, function(err, val) {
      console.log('getLocal - then');
      cb(err, val);
    });
  }

  /*================================================================ URL LIST
  */

  function saveUrlList() {
    console.log('saveUrlList');
    var val = $urlList.value;
    
    saveLocal(urlListKey, val, function() {
      console.log('saveUrlList - then');
      // notify the user
    });
  }

  function getUrlList() {
    console.log('getUrlList');

    getLocal(urlListKey, function(err, val) {
      console.log('getUrlList - then')
      if (err) {
        console.log(err)
        // notify the user
        
      } else {
        updateTextArea(val);
        // notify the user
      }
    });
  }

  function updateTextArea(val) {
    $urlList.value = val;
  }

  /*================================================================ APP
  */
  
  var init = function() {
    getUrlList();
  }

  init();

  // listen textarea
  if ($urlList.addEventListener) {
    $urlList.addEventListener('input', function() {
      // event handling code for sane browsers
      saveUrlList();

    }, false);
  } else if ($urlList.attachEvent) {
    $urlListattachEvent('onpropertychange', function() {
      // IE-specific event handling code
      saveUrlList();
    });
  }

  function updateTBody(no, url, statusCssClass, result) {
    var html = '<tr>';
    html += '<td class="' + statusCssClass + '">' + no + '</td>';
    html += '<td>' + url + '</td>';
    html += '<td>' + result + '</td>';
    html += '</tr>';

    $outputBody.innerHTML += html;
  }

  function fetchUrl(no, url) {
    console.log('fetchUrl');
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.onload = function() {
      console.log('fetchUrl - onload');

      // success
      if (request.status >= 200 && request.status < 400) {
        console.log('fetchUrl - onload - success', request);
        updateTBody(no, url, 'result-success', request.responseText);

      } else {
        // We reached our target server, but it returned an error
        console.log('fetchUrl - onload', request);
        // updateTBody(no, url, 'result', result);
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.log('fetchUrl - onerror');
      // updateTBody(no, url, 'result-fail', result);
    };

    request.send();
  }

  function lunch() {
    var val = $urlList.value;
    var urls = val.split('\n');
    var nUrls = urls.length;

    for (i = 0; i < nUrls; i++) {
      // if it url
      
      // and try catch

      fetchUrl(i, urls[i]);
    }
  }

  $lunch.addEventListener('click', function(e) {
    lunch();
  });
})();
