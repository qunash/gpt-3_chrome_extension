chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        sendRequestToAPI(request, sender, sendResponse);

        return true; // keep the message channel open to the other end until sendResponse is called
    }
);

const sendRequestToAPI = async (request, _sender, sendResponse) => {

    if (request.message === "submit") {

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

        const url = 'https://api.openai.com/v1/completions';
        const data = {
            "model": "text-davinci-002",
            "prompt": prompt,
            "temperature": parseFloat(temperature),
            "max_tokens": parseInt(max_tokens)

        };

        try {
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
        } catch (e) {
            sendResponse({ error: { message: e.message } });

        }
    }

}