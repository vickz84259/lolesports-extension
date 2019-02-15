let BASE_URL = 'https://prod-relapi.ewp.gg/persisted/gw';
let pattern = `${BASE_URL}/getEventDetails*`;

async function saveData(result) {
  let id = result.url.match(/id=(\d+)/)[1];
  let url = `${BASE_URL}/getEventDetails?hl=en-GB&id=${id}`;

  browser.webRequest.onCompleted.removeListener(saveData);

  let options = {
    headers: {
      'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
    }
  };
  let response = await fetch(url, options);
  let data = await response.json();

  await browser.storage.local.set({
    [id]: data
  });

  addListener();
}

function handleMessage(message, sender, sendResponse) {
  return browser.storage.local.get(message.id);
}

browser.runtime.onMessage.addListener(handleMessage);

function addListener() {
  /* beautify ignore:start */
  browser.webRequest.onCompleted.addListener(
    saveData,
    {
      urls: [pattern],
      types: ['xmlhttprequest']
    });
  /* beautify ignore:end */
}
addListener();