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
  let id = document.location.href.match(/\/vod\/(\d+)\//)[1];
  let storage = browser.storage.local.get(id);

  let placeholder = getElementById('video-player-placeholder');
  let videoPlayer = getElementById('video-player');

  let topDiv = getElementBySelector('.WatchVod');
  let nav = getElementBySelector('.WatchVod .nav');

  placeholder = await placeholder;
  let uuid = placeholder.getAttribute('uuid');

  topDiv = await topDiv;
  topDiv.outerHTML = `
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
                  <div id="video-player-placeholder" uuid="">
                  </div>
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

  placeholder = await getElementById('video-player-placeholder');
  placeholder.setAttribute('uuid', uuid);

  videoPlayer = await videoPlayer;
  videoPlayer.setAttribute('style', 'width: 100%');

  placeholder.appendChild(videoPlayer);

  let footer = await getElementBySelector('.Footer');
  footer.setAttribute('style', 'padding-right: 20px; padding-left: 20px');
  (await getElementBySelector('.stream-content-container')).appendChild(footer);

  let watchVod = await getElementBySelector('.WatchVod');
  watchVod.setAttribute('style', 'min-height: 0px');
  watchVod.appendChild(await nav);
}

init();