document.addEventListener('DOMContentLoaded', function() {

    var open_api_keys = document.getElementById('open_api_keys');
    open_api_keys.addEventListener('click', function() {
        chrome.tabs.create({url: 'https://beta.openai.com/account/api-keys'});
    });
    

    var saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        var api_key = document.getElementById('api_key').value;
        chrome.storage.sync.set({
            api_key: api_key
        });

        window.close();
    });

    document.getElementById('api_key').focus();

    // on ctrl+enter, click save button
    document.addEventListener('keydown', function(e) {
        if(e.ctrlKey && e.key == "Enter") {
            saveButton.click();
        }
    });
});

// restore settings on page load:
chrome.storage.sync.get(['api_key', 'temperature', 'max_tokens'], function(result) {
    document.getElementById('api_key').value = result.api_key === undefined ? '' : result.api_key;
});