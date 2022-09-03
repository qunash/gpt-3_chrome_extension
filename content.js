chrome.runtime.onMessage.addListener(
    function(request, _sender, _sendResponse) {

      if (request.greeting === "show_prompter"){

        console.log('content.js received message from background.js');

        showPrompter();

      }

    }
);

function showPrompter() {
  
    // flex div with a column of 3 elements, one below the other:
    // 1. top bar with a small x button on the right that removes the flex div from the document.
    // 2. textarea with the document's selected text
    // 3. submit button

    var flexDiv = document.createElement("div");
    flexDiv.style.display = "flex";
    flexDiv.style.flexDirection = "column";
    flexDiv.style.position = "fixed";
    flexDiv.style.top = "32%";
    flexDiv.style.left = "30%";
    flexDiv.style.width = "35%";
    flexDiv.style.height = "40%";
    flexDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    flexDiv.style.zIndex = "9999";
    flexDiv.style.border = "1px solid #000000";
    flexDiv.style.borderRadius = "5px";
    flexDiv.style.boxShadow = "0 0 10px #000000";


    var topBar = document.createElement("div");
    topBar.style.display = "flex";
    topBar.style.flexDirection = "row";
    topBar.style.justifyContent = "space-between";
    topBar.style.alignItems = "center";
    topBar.style.padding = "10px";
    topBar.style.height = "10px";
    topBar.style.backgroundColor = "white";
    topBar.style.backgroundColor = "rgba(0, 0, 255, 0.5)";

    var closeButton = document.createElement("button");
    closeButton.innerHTML = "x";
    closeButton.style.fontSize = "20px";
    closeButton.style.fontWeight = "bold";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.outline = "none";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", function() {
      document.body.removeChild(flexDiv);
    });
    closeButton.style.marginLeft = "auto";


    var textArea = document.createElement("textarea");
    textArea.id = "prompt-area";
    textArea.style.resize = "none";
    textArea.style.flex = "1";
    textArea.style.padding = "10px";
    textArea.style.fontSize = "16px";
    textArea.style.fontFamily = "monospace";
    textArea.style.backgroundColor = "white";
    textArea.style.color = "black";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.value = window.getSelection().toString().trim();

    // a bottom bar with a slider for temperature and a field for max_tokens
    var bottomBar = document.createElement("div");
    bottomBar.style.display = "flex";
    bottomBar.style.flexDirection = "row";
    bottomBar.style.justifyContent = "space-between";
    bottomBar.style.alignItems = "center";
    bottomBar.style.padding = "10px";
    bottomBar.style.height = "10px";
    bottomBar.style.backgroundColor = "white";
    bottomBar.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
    
    var temperatureLabel = document.createElement("label");
    temperatureLabel.innerHTML = "Temperature: ";
    temperatureLabel.style.marginRight = "10px";

    var temperatureSlider = document.createElement("input");
    temperatureSlider.type = "range";
    temperatureSlider.min = "0.0";
    temperatureSlider.max = "1.0";
    temperatureSlider.step = "0.1";
    chrome.storage.sync.get("temperature", function(data) {
      temperatureSlider.value = data.temperature;
    });
    temperatureSlider.style.width = "100px";


    var temperatureField = document.createElement("input");
    temperatureField.type = "text";
    chrome.storage.sync.get("temperature", function(data) {
      temperatureField.value = data.temperature;
    });
    temperatureField.style.width = "40px";
    temperatureField.style.textAlign = "center";
    temperatureField.style.border = "none";
    temperatureField.style.outline = "none";
    temperatureField.style.backgroundColor = "transparent";
    temperatureField.style.color = "white";
    temperatureField.style.fontWeight = "bold";
    temperatureField.style.fontSize = "16px";
    temperatureField.style.fontFamily = "monospace";

    temperatureSlider.oninput = function() {
      chrome.storage.sync.set({"temperature": this.value});
      temperatureField.value = this.value;
    }

    var maxTokensLabel = document.createElement("label");
    maxTokensLabel.innerHTML = "Max Tokens: ";
    maxTokensLabel.style.marginRight = "10px";

    var maxTokensField = document.createElement("input");
    maxTokensField.type = "number";
    maxTokensField.min = "1";
    maxTokensField.max = "4000";
    maxTokensField.step = "1";
    chrome.storage.sync.get(['max_tokens'], function(result) {
      maxTokensField.value = result.max_tokens;
    });
    maxTokensField.style.width = "50px";

    maxTokensField.onchange = function() {
      chrome.storage.sync.set({"max_tokens": this.value});
    }


    bottomBar.appendChild(temperatureLabel);
    bottomBar.appendChild(temperatureSlider);
    bottomBar.appendChild(temperatureField);
    bottomBar.appendChild(maxTokensLabel);
    bottomBar.appendChild(maxTokensField);


    var submitButton = document.createElement("button");
    submitButton.innerHTML = "Submit";
    submitButton.style.padding = "10px";
    submitButton.style.fontSize = "16px";
    submitButton.style.fontFamily = "monospace";
    submitButton.style.backgroundColor = "white";
    submitButton.style.color = "black";
    submitButton.style.borderTop = "1px solid #000000";
    submitButton.style.borderLeft = "none";
    submitButton.style.borderRight = "none";
    submitButton.style.borderBottom = "none";
    submitButton.style.outline = "none";
    submitButton.style.cursor = "pointer";
    submitButton.addEventListener("click", function() {
      // var text = textArea.value;
      // var url = "https://www.google.com/search?q=" + encodeURIComponent(text);
      // window.open(url, "_blank");
      // document.body.removeChild(flexDiv);

      onSubmitClick(submitButton, textArea.value);
    });

    topBar.appendChild(closeButton);
    flexDiv.appendChild(topBar);
    flexDiv.appendChild(textArea);
    flexDiv.appendChild(bottomBar);
    flexDiv.appendChild(submitButton);
    document.body.appendChild(flexDiv);
    textArea.focus();

    makeFlexDivDraggable(topBar, flexDiv);

    makeResizableDiv(flexDiv);

    // click submit button when ctrl+enter is pressed inside the textarea
    textArea.addEventListener('keydown', (event) => {
      if(event.ctrlKey && event.key == "Enter") {
        submitButton.click();
      }
    });
  }

  function makeFlexDivDraggable(topBar, flexDiv) {
    
    // make the flex div draggable by the top bar
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    topBar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      flexDiv.style.top = (flexDiv.offsetTop - pos2) + "px";
      flexDiv.style.left = (flexDiv.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function makeResizableDiv(flexDiv) {

    // make the flex div resizable by the bottom right corner
    var resizer = document.createElement("div");
    resizer.style.position = "absolute";
    resizer.style.bottom = "0";
    resizer.style.right = "0";
    resizer.style.width = "20px";
    resizer.style.height = "20px";
    resizer.style.backgroundColor = "white";
    resizer.style.outline = "none";
    resizer.style.cursor = "se-resize";
    resizer.innerHTML = "<p style='font-size: 10px; margin: 0; padding: 0; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);'><></p>";
    resizer.addEventListener("mousedown", initResize, false);

    flexDiv.appendChild(resizer);

    var originalWidth = 0;
    var originalHeight = 0;
    var originalX = 0;
    var originalY = 0;
    var originalMouseX = 0;
    var originalMouseY = 0;

    function initResize(e) {
      originalWidth = parseFloat(getComputedStyle(flexDiv, null).getPropertyValue('width').replace('px', ''));
      originalHeight = parseFloat(getComputedStyle(flexDiv, null).getPropertyValue('height').replace('px', ''));
      originalX = flexDiv.getBoundingClientRect().left;
      originalY = flexDiv.getBoundingClientRect().top;
      originalMouseX = e.pageX;
      originalMouseY = e.pageY;
      window.addEventListener('mousemove', resize, false);
      window.addEventListener('mouseup', stopResize, false);
    }

    function resize(e) {
      if (originalWidth > 0) {
        flexDiv.style.width = (originalWidth + (e.pageX - originalMouseX)) + 'px';
      }
      if (originalHeight > 0) {
        flexDiv.style.height = (originalHeight + (e.pageY - originalMouseY)) + 'px';
      }
    }

    function stopResize(_e) {
      window.removeEventListener('mousemove', resize, false);
      window.removeEventListener('mouseup', stopResize, false);
    }

  }

  function onSubmitClick(submitButton, text) {

    textArea = document.getElementById("prompt-area");

    // slightly grey out and disable the submit button and textarea
    submitButton.style.backgroundColor = "#e6e6e6";

    // show the loading animation
    var loadingAnimation = document.createElement("div");
    loadingAnimation.style.position = "absolute";
    loadingAnimation.style.top = "50%";
    loadingAnimation.style.left = "50%";
    loadingAnimation.style.transform = "translate(-50%, -50%)";
    loadingAnimation.style.width = "20px";
    loadingAnimation.style.height = "20px";
    loadingAnimation.style.border = "3px solid #000000";
    loadingAnimation.style.borderRadius = "50%";
    loadingAnimation.style.borderTop = "3px solid #ffffff";
    loadingAnimation.style.animation = "spin 1s linear infinite";
    submitButton.appendChild(loadingAnimation);

    submitButton.disabled = true;
    textArea.disabled = true;

    // send a message to the background script
    chrome.runtime.sendMessage({
      message: "submit",
      text: text
    }, function(response) {
      
      // response example:
      // {
      //   "id": "cmpl-5mTN14LaX43ebfsqduhC4NLNuBCAA",
      //   "object": "text_completion",
      //   "created": 1662234327,
      //   "model": "text-davinci-002",
      //   "choices": [
      //     {
      //       "text": "\n\nPi is a mathematical constant that is the ratio of a circle's circumference to its diameter.",
      //       "index": 0,
      //       "logprobs": null,
      //       "finish_reason": "stop"
      //     }
      //   ],
      //   "usage": {
      //     "prompt_tokens": 4,
      //     "completion_tokens": 20,
      //     "total_tokens": 24
      //   }
      // }
      // extract the text from the response

      // append the text to the textarea
      try {
        textArea.value += response.choices[0].text;
      } catch (e) {
        textArea.value += "Error: " + e;
      }
      
      // remove the loading animation
      submitButton.removeChild(loadingAnimation);
      submitButton.style.backgroundColor = "white";
      submitButton.disabled = false;
      textArea.disabled = false;
      textArea.focus();

      console.log("api response: ", response);
    });
  }