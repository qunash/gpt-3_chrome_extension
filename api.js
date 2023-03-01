chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        sendRequestToAPI(request, sender, sendResponse);

        return true; // keep the message channel open to the other end until sendResponse is called
    }
);

const sendRequestToAPI = async (request, _sender, sendResponse) => {

    if (request.message === "submit") {

        var prompt = request.text;

        // set 'api_key', 'temperature', 'max_tokens' from chrome.storage.sync.get all at once
        const { api_key, temperature, max_tokens } = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(['api_key', 'temperature', 'max_tokens'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });

        const url = 'https://api.openai.com/v1/completions';
        const data = {
            "model": "text-davinci-003",
            "prompt": prompt,
            "temperature": parseFloat(temperature),
            "max_tokens": parseInt(max_tokens)
        };

        // const url = "https://api.openai.com/v1/chat/completions";
        // const headers = {
        //     "Content-Type": "application/json",
        //     "Authorization": `Bearer ${api_key}`
        // };
        // const data = JSON.stringify({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         {
        //             role: "user",
        //             content: prompt
        //         }
        //     ]
        // });

        try {
            // const response = await fetch(url, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${api_key}`
            //     },
            //     body: JSON.stringify(data)
            // });
            // const json = await response.json();
            // sendResponse(json);

            // const response = await fetch(url, {
            //     method: "POST",
            //     headers: headers,
            //     body: data
            // });
            // const json = await response.json();
            // sendResponse(json);        

        } catch (e) {
            sendResponse({ error: { message: e.message } });

        }
    }

}
