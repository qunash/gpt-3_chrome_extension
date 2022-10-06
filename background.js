importScripts('api.js');

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        api_token: '',
        temperature: 0.7,
        max_tokens: 64
    });
});

chrome.commands.onCommand.addListener(async function(command) {

    if (command === 'show_prompter') {

        let tab = await getCurrentTab();

        try {

           chrome.tabs.sendMessage(tab.id, {greeting: 'show_prompter'});

        } catch (e) {
            console.log(e);
            return; // ignoring unsupported pages like chrome://
        }

    }
});

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}