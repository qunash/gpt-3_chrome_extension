document.addEventListener('DOMContentLoaded', function() {
    var saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function() {
        var api_token = document.getElementById('api_token').value;
        chrome.storage.sync.set({
            api_token: api_token
        });

        window.close();
    });

    document.getElementById('api_token').focus();

    // on ctrl+enter, click save button
    document.addEventListener('keydown', function(e) {
        if(e.ctrlKey && e.key == "Enter") {
            saveButton.click();
        }
    });
});

// restore settings on page load:
chrome.storage.sync.get(['api_token', 'temperature', 'max_tokens'], function(result) {
    document.getElementById('api_token').value = result.api_token === undefined ? '' : result.api_token;
});