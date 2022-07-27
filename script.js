const inputGroupTemplate = `<span class="input-group-text">CSS Selector</span>
<input type="text" class="form-control w-25 p-1 css-selector-input">
<span class="input-group-text">Key</span>
<input type="text" class="form-control key-input">`;

function getInputGroupTemplate() {
  const inputGroupDiv = document.createElement("div");
  inputGroupDiv.className = "input-group input-group-sm mb-3";
  inputGroupDiv.innerHTML = inputGroupTemplate;
  return inputGroupDiv;
}

function getData(inputSchema) {
  let data = {};
  console.log(inputSchema);
  inputSchema.forEach((input) => {
    const elementSelector = document.querySelector(input.cssSelector);
    if (elementSelector) {
      data[input.key] = elementSelector.innerText;
    }
  });
  return data;
}

function setLocalStorage(value) {
  chrome.storage.local.set({ data: value }, function () {
    console.log("Value added to local storage!");
  });
}

function downloadLocalStorage() {
  chrome.storage.local.get(null, function (items) {
    var result = JSON.stringify(items);
    var url = "data:text/json;charset=utf-8," + encodeURIComponent(result);
    chrome.downloads.download({
      url: url,
      filename: "data.json",
    });
  });
}

document
  .getElementById("local-storage-download")
  .addEventListener("click", function () {
    downloadLocalStorage();
  });

document
  .getElementById("local-storage-clear")
  .addEventListener("click", function () {
    setLocalStorage([]);
  });

document
  .getElementById("data-input-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = document.getElementById("data-input-form");
    const inputSchema = [];
    const dataInputGroupDiv = formData.children[1];
    for (let i = 0; i < dataInputGroupDiv.childElementCount; i++) {
      const dataInputItem = dataInputGroupDiv.children[i];
      const cssSelector = dataInputItem.querySelector(
        ".css-selector-input"
      ).value;
      const key = dataInputItem.querySelector(".key-input").value;
      inputSchema.push({ cssSelector, key });
    }
    chrome.tabs.query({ active: true }, function (tabs) {
      chrome.scripting.executeScript(
        { target: { tabId: tabs[0].id }, func: getData, args: [inputSchema] },
        (results) => {
          chrome.storage.local.get(["data"], function (result) {
            let data = [];
            data = result.data;
            if (!data) {
              setLocalStorage([]);
              data = [];
            }
            data.push(results[0].result);
            setLocalStorage(data);
          });
        }
      );
    });
  });

document
  .getElementById("add-field-button")
  .addEventListener("click", function () {
    document.getElementById("data-input-group").append(getInputGroupTemplate());
  });

document
  .getElementById("clear-fields-button")
  .addEventListener("click", function () {
    document
      .getElementById("data-input-group")
      .replaceChildren(getInputGroupTemplate());
  });
