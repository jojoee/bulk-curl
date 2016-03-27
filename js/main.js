/**
 * [scrollIntoView description]
 *
 * @see http://stackoverflow.com/questions/4801655/how-to-go-to-a-specific-element-on-page
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function scrollIntoView(e) {
  if (!!e && e.scrollIntoView) {
   e.scrollIntoView();
  }
}

/**
 * [isURL description]
 * 
 * @see http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url 
 * 
 * @param  {[type]}  str [description]
 * @return {Boolean}     [description]
 */
function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

  return pattern.test(str);
}

function issuePopup() {
  var titleHtml = 'Issue';
  var bodyHtml = 'something wrong on the connection<br> \
    there are common issue called CORS, if you face this issue \
    please try to install <a target="_blank" href="https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en">this plugin</a>.';

  swal({
    title: titleHtml,
    text: bodyHtml,
    html: true
  });
}

(function() {
  'use strict';

  /*================================================================ GLOBAL
  */

  var appDomain = 'jblunkcurl';

  var $firstScreen = document.getElementById('first-screen');
  var $urlList = document.getElementById('url-list');
  var $lunch = document.getElementById('lunch');

  var $secondScreen = document.getElementById('second-screen');
  var $outputBody = document.getElementById('output-body');

  var urlListKey = 'urllist';
  var i = 0;
  var isDebug = false;
  var nFetchedUrls = 0;
  var nUrls = 0;

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

  /*================================================================ URL LIST & TEXTAREA
  */

  function saveUrlList() {
    appLog('saveUrlList');
    var val = $urlList.value;
    
    saveLocal(urlListKey, val, function() {
      appLog('saveUrlList - then');
      // notify the user
    });
  }

  function initUrlList() {
    appLog('getUrlList');

    getLocal(urlListKey, function(err, val) {
      appLog('getUrlList - then');
      if (err) {
        appLog('getUrlList - then - error', err);
        activateSuperplaceholder();
        // notify the user
        
      } else {
        appLog('getUrlList - then - noerror');
        if (val) {
          updateTextArea(val);
        
        } else {
          // no data
          activateSuperplaceholder();
        }
      }
    });
  }

  function updateTextArea(val) {
    appLog('updateTextArea');
    $urlList.value = val;
  }

  function activateSuperplaceholder() {
    var placeholderMsgs = [
      'http://yourtarget/',
      'http://yourtarget/user/',
      'http://yourtarget/user/2'
    ]
    var placeholderText = placeholderMsgs.join('\n');

    superplaceholder({
      el: $urlList,
      sentences: [
        placeholderText
      ],
      options: {
        letterDelay: 40,
        sentenceDelay: 200,
        startOnFocus: false,
        loop: false,
        shuffle: false,
        showCursor: true,
        cursor: '|'
      }
    });
  }

  /**
   * [initTextareaListener description]
   *
   * @see http://stackoverflow.com/questions/2823733/textarea-onchange-detection 
   * @return {[type]} [description]
   */
  function initTextareaListener() {
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
  }

  /*================================================================ TABLE
  */
 
  function clearOutputTable() {
    nUrls = 0;
    nFetchedUrls = 0;
    $outputBody.innerHTML = '';
  }

  function addToOutputTable(no, url, result) {
    var html = '<tr id="url-' + no + '">';
    html += '<td>' + no + '</td>';
    html += '<td>' + url + '</td>';
    html += '<td>' + result + '</td>';
    html += '</tr>';

    $outputBody.innerHTML += html;
  }

  function updateOutputTable(no, statusCssClass, result) {
    var $e = document.getElementById('url-' + no);
    var $columns = $e.getElementsByTagName('td');
    var $status = $columns[0];
    var $result = $columns[2];

    $status.classList.add(statusCssClass);
    $result.innerHTML = result;
  }

  /*================================================================ APP
  */
  
  var init = function() {
    appLog('init');
    initTextareaListener();
    initUrlList();
  }

  function checkAllFetchedUrls() {
    nFetchedUrls++;

    if (nFetchedUrls >= nUrls) {
      sweetAlert('Done');
    }
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
        updateOutputTable(no, 'result-success', request.responseText);
        checkAllFetchedUrls();

      } else {
        // We reached our target server, but it returned an error
        appLog('fetchUrl - onload', request);
        updateOutputTable(no, 'result-warning', 'server error');
        checkAllFetchedUrls();
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      appLog('fetchUrl - onerror');
      updateOutputTable(no, 'result-fail', 'something wrong, please see <a class="issue" href="#issue" onclick="issuePopup()">this</a>');
      checkAllFetchedUrls();
    };

    request.send();
  }

  /**
   * [lunch description]
   *
   * @see http://stackoverflow.com/questions/2299604/javascript-convert-textarea-into-an-array
   * @return {[type]} [description]
   */
  function lunch() {
    var val = $urlList.value;
    var urls = val.split('\n');
    var nLines = urls.length;
    nUrls = nLines;

    clearOutputTable();
    for (i = 0; i < nLines; i++) {
      var url = urls[i].trim();
      nUrls++;

      if (isURL(url)) {
        addToOutputTable(i, url, '');
        fetchUrl(i, urls[i]);

      } else {
        addToOutputTable(i, url, 'it\'s not url');
        checkAllFetchedUrls();
      }
    }
  }

  $lunch.addEventListener('click', function(e) {
    scrollIntoView($secondScreen);
    lunch();
  });

  init();
})();
