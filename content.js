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

  var settingsPopup = document.createElement('div');
  settingsPopup.className = "gpt3_prompter___settings-popup";

  var input = document.createElement('input');
  input.className = "gpt3_prompter___input-field";
  input.placeholder = 'Enter your API key';
  input.style.width = '80%';
  input.style.height = '30px';
  input.style.margin = '10px';
  input.style.padding = '10px';

  var hint = document.createElement('p');
  hint.className = "gpt3_prompter___gray-text";
  hint.innerHTML = "You can change it later in the extension's popup menu.";


  var get_api_key = document.createElement('button');
  get_api_key.className = "gpt3_prompter___button";
  get_api_key.setAttribute('autocomplete', 'off');
  get_api_key.innerHTML = 'Get API key';


  var saveBtn = document.createElement('button');
  saveBtn.className = "gpt3_prompter___button";
  saveBtn.innerHTML = "Save";

  appendChildren(settingsPopup, [input, hint, get_api_key, saveBtn]);

  document.body.appendChild(settingsPopup);

  input.focus();

  get_api_key.addEventListener('click', function () {
    window.open('https://beta.openai.com/account/api-keys');
  });

  saveBtn.addEventListener('click', function () {
    chrome.storage.sync.set({ api_key: input.value }, function () {
      settingsPopup.remove();
      if (input.value !== '') {
        showPrompter();
      }
    });
  });

  input.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key == "Enter") {
      saveBtn.click();
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

  var prompter = document.createElement("div");
  prompter.className = "gpt3_prompter___prompt-popup";

  var topBar = document.createElement("div");
  topBar.className = "gpt3_prompter___prompt-top-bar";

  var closeBtn = document.createElement("button");
  closeBtn.innerHTML = "x";
  closeBtn.className = "gpt3_prompter___prompt-close-button";
  closeBtn.addEventListener("click", function () {
    document.body.removeChild(prompter);
  });

  var textArea = document.createElement("div");
  textArea.setAttribute('contenteditable', true);
  textArea.id = "gpt3_prompter___prompt-area";
  textArea.innerHTML = selectedText;

  var bottomBar = document.createElement("div");
  bottomBar.className = "gpt3_prompter___prompt-bottom-bar";

  var tempLabel = document.createElement("div");
  tempLabel.innerHTML = "Temperature: ";
  tempLabel.style.marginRight = "10px";
  tempLabel.className = "gpt3_prompter___white-text";

  var tempSlider = document.createElement("input");
  tempSlider.type = "range";
  tempSlider.className = "gpt3_prompter___input-range";
  tempSlider.min = "0.0";
  tempSlider.max = "1.0";
  tempSlider.step = "0.1";
  chrome.storage.sync.get("temperature", function (data) {
    tempSlider.value = data.temperature;
  });
  tempSlider.style.width = "100px";


  var tempField = document.createElement("div");
  chrome.storage.sync.get("temperature", function (data) {
    tempField.innerHTML = data.temperature;
  });
  tempField.className = "gpt3_prompter___white-text-bold";

  tempSlider.oninput = function () {
    chrome.storage.sync.set({ "temperature": this.value });
    tempField.innerHTML = this.value;
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


  appendChildren(bottomBar, [tempLabel, tempSlider, tempField, maxTokensLabel, maxTokensField]);


  var submitBtn = document.createElement("button");
  submitBtn.innerHTML = "Submit";
  submitBtn.title = "Ctrl+Enter";
  submitBtn.className = "gpt3_prompter___prompt-submit-button";
  submitBtn.addEventListener("click", function () {
    onSubmitClick(submitBtn, textArea.textContent);
  });

  topBar.appendChild(closeBtn);

  appendChildren(prompter, [topBar, textArea, bottomBar, submitBtn]);


  document.body.appendChild(prompter);
  putCursorAtTheEnd(textArea);

  // set max lines to 20 in contenteditable textArea
  textArea.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  }, false);

  makePrompterDraggable(topBar, prompter);
  makePrompterResizable(prompter);

  textArea.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == "Enter") {
      submitBtn.click();
    }
    if (!event.ctrlKey && !event.altKey && event.key.length == 1) {
      resetBackground(textArea);
    }
  });

  // paste only plain text
  textArea.addEventListener('paste', (event) => {
    event.preventDefault();
    var text = (event.originalEvent || event).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  });

  prompter.addEventListener('keydown', (event) => {
    if (event.key == "Escape") {
      closeBtn.click();
    }
  });
}

function putCursorAtTheEnd(textArea) {

  range = document.createRange();
  range.selectNodeContents(textArea);
  range.collapse(false);
  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range)

  // scroll to the bottom
  textArea.scrollTop = textArea.scrollHeight;
}

function appendChildren(parent, children) {
  children.forEach(child => parent.appendChild(child));
}

function makePrompterDraggable(topBar, prompter) {

  // make draggable by the top bar
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
    prompter.style.top = (prompter.offsetTop - pos2) + "px";
    prompter.style.left = (prompter.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function makePrompterResizable(prompter) {

  var resizeHandle = document.createElement("div");
  resizeHandle.className = "gpt3_prompter___resizer";
  resizeHandle.innerHTML = "<p style='font-size: 10px; margin: 0; padding: 0; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);'><></p>";
  resizeHandle.addEventListener("mousedown", initResize, false);

  prompter.appendChild(resizeHandle);

  var originalWidth = 0;
  var originalHeight = 0;
  var originalX = 0;
  var originalY = 0;
  var originalMouseX = 0;
  var originalMouseY = 0;

  function initResize(e) {
    originalWidth = parseFloat(getComputedStyle(prompter, null).getPropertyValue('width').replace('px', ''));
    originalHeight = parseFloat(getComputedStyle(prompter, null).getPropertyValue('height').replace('px', ''));
    originalX = prompter.getBoundingClientRect().left;
    originalY = prompter.getBoundingClientRect().top;
    originalMouseX = e.pageX;
    originalMouseY = e.pageY;
    window.addEventListener('mousemove', resize, false);
    window.addEventListener('mouseup', stopResize, false);
  }

  function resize(e) {
    if (originalWidth > 0) {
      prompter.style.width = (originalWidth + (e.pageX - originalMouseX)) + 'px';
    }
    if (originalHeight > 0) {
      prompter.style.height = (originalHeight + (e.pageY - originalMouseY)) + 'px';
    }
  }

  function stopResize(_e) {
    window.removeEventListener('mousemove', resize, false);
    window.removeEventListener('mouseup', stopResize, false);
  }

}

function resetBackground(textArea) {
  var allElements = textArea.getElementsByTagName("*");
  for (var i = 0; i < allElements.length; i++) {
    allElements[i].style.backgroundColor = "";
  }
}


function onSubmitClick(submitButton, text) {

  textArea = document.getElementById("gpt3_prompter___prompt-area");

  // loading animation
  var loadingAnimation = document.createElement("div");
  loadingAnimation.className = "gpt3_prompter___loading-animation";
  submitButton.appendChild(loadingAnimation);

  submitButton.disabled = true;

  chrome.runtime.sendMessage({
    message: "submit",
    text: text
  }, function (response) {

    resetBackground(textArea);

    var span = document.createElement("span");
    if (response.error == null) {

      span.style.backgroundColor = "#d2f4d3";
      console.log(response);
      span.innerHTML = response.choices[0].text;
      textArea.appendChild(span);
    } else {
      span.style.backgroundColor = "#f4d3d3";
      span.innerHTML = "<br><br>Error: " + response.error.message;
      textArea.appendChild(span);
    }

    submitButton.removeChild(loadingAnimation);
    submitButton.disabled = false;
    putCursorAtTheEnd(textArea);

  });
}