function delay(timeout = 1000) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(), timeout);
  })

  return promise;
}

function getElementById(id) {
  return getElement(id, null);
}

function getElementBySelector(selector) {
  return getElement(null, selector);
}

async function getElement(id = null, selector = null) {
  let result = null;
  while (true) {
    if (id) {
      result = document.getElementById(id);
    } else {
      result = document.body.querySelector(selector);
    }

    if (result) {
      break;
    }

    await delay();
  }

  return result;
}

async function init() {
  let topDiv = getElementBySelector('.WatchVod');
  let nav = getElementBySelector('.WatchVod .nav');
  let placeholder = await getElementById('video-player-placeholder');

  // This is needed since the partials are being precompiled as templates
  Handlebars.partials = Handlebars.templates;

  // Getting the id from the url
  let id = document.location.href.match(/\/vod\/(\d+)\//)[1];
  let data = browser.storage.local.get(id);

  (await topDiv).outerHTML = Handlebars.templates['main']({
    'teams': (await data)[id].data.event.match.teams
  });

  let videoPlayer = await getElementById('video-player');
  videoPlayer.setAttribute('style', '');

  placeholder.appendChild(videoPlayer);
  (await getElementBySelector('.VideoPlayer')).appendChild(placeholder);

  (await getElementBySelector('.stream-content-container')).appendChild(
    await getElementBySelector('.Footer'));

  (await getElementBySelector('.WatchVod')).appendChild(await nav);
}

init();