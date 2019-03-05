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

  (await topDiv).outerHTML = `
    <div id="page-container" class="main-section right-panel-container
        content-container">
      <div id="ember1023" class="ember-view tse-scrollable">
        <div class="tse-scrollbar" style="display: none;">
          <div class="drag-handle"></div>
        </div>
        <div class="tse-scroll-content">
          <div class="tse-content">
            <div class="stream-content-container">
              <span class="clearfix"></span>
              <div class="stream-container">
                <div class="VideoPlayer">
                </div>
              </div>
              <div class="WatchVod">
              </div>
            </div>
            <div id="ember1131" class="ember-view">
            </div>
          </div>
        </div>
      </div>
    </div>`;
  addStats();

  let videoPlayer = await getElementById('video-player');
  videoPlayer.setAttribute('style', '');

  placeholder.appendChild(videoPlayer);
  (await getElementBySelector('.VideoPlayer')).appendChild(placeholder);

  (await getElementBySelector('.stream-content-container')).appendChild(
    await getElementBySelector('.Footer'));

  (await getElementBySelector('.WatchVod')).appendChild(await nav);
}

async function addStats() {
  // Getting the id from the url
  let id = document.location.href.match(/\/vod\/(\d+)\//)[1];
  let teams = (await browser.storage.local.get(id))[id].data.event.match.teams;

  // This is needed since the partials are being precompiled as templates
  Handlebars.partials = Handlebars.templates;

  let sideBar = await getElementBySelector('.tse-content .ember-view');
  sideBar.innerHTML = Handlebars.templates['stats']({
    'teams': teams
  })
}

init();