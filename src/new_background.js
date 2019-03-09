function addListener() {
  /* beautify ignore:start */
  browser.webNavigation.onHistoryStateUpdated.addListener(
    prepareData,
    {
      url: [{
        hostSuffix: '.lolesports.com',
        pathContains: 'vod'
      }]
    });
  /* beautify ignore:end */
}

function isEmpty(object) {
  return (Object.keys(object).length === 0 && object.constructor === Object);
}

async function prepareData(result) {
  let regexPattern = /^https:\/\/watch\.\w+\.lolesports\.com\/vod\/\d+\/\d$/;
  if (!regexPattern.test(result.url)) {
    return;
  }

  let id = result.url.match(/vod\/(\d+)\//)[1];
  let data = await browser.storage.local.get(id);

  if (isEmpty(data)) {
    saveData(id);
  }
}

async function saveData(id) {
  let baseUrl = 'https://prod-relapi.ewp.gg/persisted/gw';
  let url = `${baseUrl}/getEventDetails?hl=en-GB&id=${id}`;

  let options = {
    headers: {
      'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
    }
  };
  let response = fetch(url, options);
  browser.storage.local.set({
    [id]: (await (await response).json())
  });
}

addListener();