chrome.runtime.onMessage.addListener(
  function (request, _sender, _sendResponse) {

    if (request.greeting === "show_prompter") {

      chrome.storage.sync.get(['api_key'], function (result) {
        if (result.api_key === undefined || result.api_key === '') {
          showSettingsPage();
        } else {
          showPrompter();
        }
      });
    }
  }
);

function showSettingsPage() {

  if (document.getElementsByClassName("gpt3_prompter___settings-popup").length > 0) {
    document.getElementsByClassName("gpt3_prompter___settings-popup")[0].focus();
    return;
  }

  var div = document.createElement('div');
  div.className = "gpt3_prompter___settings-popup";

  var input = document.createElement('input');
  input.className = "gpt3_prompter___input-field";
  input.placeholder = 'Enter your API key';
  input.style.width = '80%';
  input.style.height = '30px';
  input.style.margin = '10px';
  input.style.padding = '10px';

  var text = document.createElement('p');
  text.style.fontSize = '14px';
  text.style.margin = '4px';
  text.style.padding = '4px';
  text.style.color = '#666';
  text.innerHTML = "You can change your API key in the extension's popup menu later.";

  var open_api_keys = document.createElement('button');
  open_api_keys.className = "gpt3_prompter___button";
  open_api_keys.setAttribute('autocomplete', 'off');
  open_api_keys.innerHTML = 'Get API key';


  var save = document.createElement('button');
  save.className = "gpt3_prompter___button";
  save.innerHTML = "Save";

  div.appendChild(input);
  div.appendChild(text);
  div.appendChild(open_api_keys);
  div.appendChild(save);

  document.body.appendChild(div);

  input.focus();

  open_api_keys.addEventListener('click', function () {
    window.open('https://beta.openai.com/account/api-keys');
  });

  save.addEventListener('click', function () {
    chrome.storage.sync.set({ api_key: input.value }, function () {
      div.remove();
      if (input.value !== '') {
        showPrompter();
      }
    });
  });

  input.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key == "Enter") {
      save.click();
    }
  });

}



function showPrompter() {

  const selectedText = window.getSelection().toString().trim();

  if (document.getElementsByClassName("gpt3_prompter___prompt-popup").length > 0) {
    var textArea = document.getElementById("gpt3_prompter___prompt-area");

    if (selectedText !== "") {
      textArea.value = selectedText;
    }

    textArea.focus();

    return;
  }

  var flexDiv = document.createElement("div");
  flexDiv.className = "gpt3_prompter___prompt-popup";

  var topBar = document.createElement("div");
  topBar.className = "gpt3_prompter___prompt-top-bar";

  var closeButton = document.createElement("button");
  closeButton.innerHTML = "x";
  closeButton.className = "gpt3_prompter___prompt-close-button";
  closeButton.addEventListener("click", function () {
    document.body.removeChild(flexDiv);
  });

  var textArea = document.createElement("div");
  textArea.setAttribute('contenteditable', true);
  textArea.id = "gpt3_prompter___prompt-area";
  textArea.innerHTML = selectedText;

  var bottomBar = document.createElement("div");
  bottomBar.className = "gpt3_prompter___prompt-bottom-bar";

  var temperatureLabel = document.createElement("div");
  temperatureLabel.innerHTML = "Temperature: ";
  temperatureLabel.style.marginRight = "10px";
  temperatureLabel.className = "gpt3_prompter___white-text";

  var temperatureSlider = document.createElement("input");
  temperatureSlider.type = "range";
  temperatureSlider.className = "gpt3_prompter___input-range";
  temperatureSlider.min = "0.0";
  temperatureSlider.max = "1.0";
  temperatureSlider.step = "0.1";
  chrome.storage.sync.get("temperature", function (data) {
    temperatureSlider.value = data.temperature;
  });
  temperatureSlider.style.width = "100px";


  var temperatureField = document.createElement("div");
  chrome.storage.sync.get("temperature", function (data) {
    temperatureField.innerHTML = data.temperature;
  });
  temperatureField.className = "gpt3_prompter___white-text-bold";

  temperatureSlider.oninput = function () {
    chrome.storage.sync.set({ "temperature": this.value });
    temperatureField.innerHTML = this.value;
  }

  var maxTokensLabel = document.createElement("div");
  maxTokensLabel.innerHTML = "Max tokens: ";
  maxTokensLabel.style.marginRight = "10px";
  maxTokensLabel.className = "gpt3_prompter___white-text";

  var maxTokensField = document.createElement("input");
  maxTokensField.type = "number";
  maxTokensField.min = "1";
  maxTokensField.max = "4000";
  maxTokensField.step = "1";
  chrome.storage.sync.get(['max_tokens'], function (result) {
    maxTokensField.value = result.max_tokens;
  });
  maxTokensField.className = "gpt3_prompter___input-field";

  maxTokensField.onchange = function () {
    chrome.storage.sync.set({ "max_tokens": this.value });
  }


  bottomBar.appendChild(temperatureLabel);
  bottomBar.appendChild(temperatureSlider);
  bottomBar.appendChild(temperatureField);
  bottomBar.appendChild(maxTokensLabel);
  bottomBar.appendChild(maxTokensField);


  var submitButton = document.createElement("button");
  submitButton.innerHTML = "Submit";
  submitButton.className = "gpt3_prompter___prompt-submit-button";
  submitButton.addEventListener("click", function () {
    onSubmitClick(submitButton, textArea.textContent);
  });

  topBar.appendChild(closeButton);
  flexDiv.appendChild(topBar);
  flexDiv.appendChild(textArea);
  flexDiv.appendChild(bottomBar);
  flexDiv.appendChild(submitButton);
  document.body.appendChild(flexDiv);
  textArea.focus();

  makeFlexDivDraggable(topBar, flexDiv);

  makeFlexDivResizable(flexDiv);

  textArea.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == "Enter") {
      submitButton.click();
    }
    // if the user types any character, reset the background color
    if (event.key.length === 1) {
      resetBackground();
    }
  });

  // paste only plain text
  textArea.addEventListener('paste', (event) => {
    event.preventDefault();
    var text = (event.originalEvent || event).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  });

  flexDiv.addEventListener('keydown', (event) => {
    if (event.key == "Escape") {
      closeButton.click();
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

function makeFlexDivResizable(flexDiv) {

  var resizer = document.createElement("div");
  resizer.className = "gpt3_prompter___resizer";
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

function resetBackground() {
  var allElements = textArea.getElementsByTagName("*");
  for (var i = 0; i < allElements.length; i++) {
    allElements[i].style.backgroundColor = "";
  }
}


function onSubmitClick(submitButton, text) {

  textArea = document.getElementById("gpt3_prompter___prompt-area");

  // show the loading animation
  var loadingAnimation = document.createElement("div");
  loadingAnimation.className = "gpt3_prompter___loading-animation";
  submitButton.appendChild(loadingAnimation);

  submitButton.disabled = true;
  // textArea.disabled = true;

  chrome.runtime.sendMessage({
    message: "submit",
    text: text
  }, function (response) {

    resetBackground();

    var span = document.createElement("span");
    try {
      span.style.backgroundColor = "#d2f4d3";
      span.innerHTML = response.choices[0].text;
      textArea.appendChild(span);
    } catch (e) {
      span.style.backgroundColor = "#f4d3d3";
      if (response.error) {
        span.innerHTML = '\n\nError: ' + response.error.message;
      } else {
        span.innerHTML = "Error: " + e;
      }
      textArea.appendChild(span);
    }

    submitButton.removeChild(loadingAnimation);
    submitButton.disabled = false;
    // textArea.disabled = false;
    textArea.focus();
  });
}