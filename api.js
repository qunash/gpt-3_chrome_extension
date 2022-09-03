// window.addEventListener('message', function(event) {

//     if (event.data.message === "submit") {

//         console.log('api.js received message from content.js');

//         var prompt = request.text;

//         // extract params from storage
//         var api_token = localStorage.getItem('api_token');
//         var temperature = localStorage.getItem('temperature');
//         var max_tokens = localStorage.getItem('max_tokens');

//         var xhr = new XMLHttpRequest();
//         xhr.open('POST', 'https://api.openai.com/v1/completions', true);
//         xhr.setRequestHeader('Content-Type', 'application/json');
//         xhr.setRequestHeader('Authorization', 'Bearer ' + api_token);
//         xhr.onreadystatechange = function () {
//             if (xhr.readyState === 4) {
//                 var response = JSON.parse(xhr.responseText);
//                 var text = response.choices[0].text;

//                 console.log('response from api: ' + text);
//                 // send the text to the content script
//                 // sendResponse({ message: "response", text: text });
//             }
//         };
//         xhr.send(JSON.stringify({
//             model: 'text-davinci-002',
//             prompt: prompt,
//             temperature: temperature,
//             max_tokens: max_tokens
//         }));
//     }
// });

// receive submit event from content.js
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        sendRequestToAPI(request, sender, sendResponse);

        return true; // keep the message channel open to the other end until sendResponse is called
    }
);

const sendRequestToAPI = async (request, _sender, sendResponse) => {

    if (request.message === "submit") {

        console.log('api.js received message from content.js');

        var prompt = request.text;

        // set 'api_token', 'temperature', 'max_tokens' from chrome.storage.sync.get all at once
        const { api_token, temperature, max_tokens } = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(['api_token', 'temperature', 'max_tokens'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });

        console.log('api_token: ' + api_token + ', temperature: ' + temperature + ', max_tokens: ' + max_tokens);

        const url = 'https://api.openai.com/v1/completions';
        const data = {
            "model": "text-davinci-002",
            "prompt": prompt,
            "temperature": parseFloat(temperature),
            "max_tokens": parseInt(max_tokens)

        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_token}`
            },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        sendResponse(json);
    }

}