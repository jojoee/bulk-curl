chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = "http://jojoee.github.io/bulk-curl/";
  chrome.tabs.create({ url: newURL });
});
