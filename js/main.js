
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
  var isDebug = true;

  function appLog(log) {
    if (isDebug) {
      console.log(log);
    }
  }

  function saveLocal(key, val, cb) {
    appLog('saveLocal');
    var localKey = appDomain + key;

    localforage.setItem(localKey, val).then(function() {
      appLog('saveLocal - then');
      cb();
    });
  }

  function getLocal(key, cb) {
    appLog('getLocal');
    var localKey = appDomain + key;

    localforage.getItem(localKey, function(err, val) {
      appLog('getLocal - then');
      cb(err, val);
    });
  }

  /*================================================================ URL LIST
  */

  function saveUrlList() {
    appLog('saveUrlList');
    var val = $urlList.value;
    
    saveLocal(urlListKey, val, function() {
      appLog('saveUrlList - then');
      // notify the user
    });
  }

  function getUrlList() {
    appLog('getUrlList');

    getLocal(urlListKey, function(err, val) {
      appLog('getUrlList - then')
      if (err) {
        appLog(err)
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
    appLog('fetchUrl');
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.onload = function() {
      appLog('fetchUrl - onload');

      // success
      if (request.status >= 200 && request.status < 400) {
        appLog('fetchUrl - onload - success', request);
        updateTBody(no, url, 'result-success', request.responseText);

      } else {
        // We reached our target server, but it returned an error
        appLog('fetchUrl - onload', request);
        updateTBody(no, url, 'result-warning', '');
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      appLog('fetchUrl - onerror');
      updateTBody(no, url, 'result-fail', '');
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
