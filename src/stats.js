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
  let sideBar = await getElementBySelector('.tse-content .ember-view');
  sideBar.innerHTML = `
    <div id="stream-side-nav-container" class="side-panel-container">
      <div class="tabs-container">
        <div class="tabs-wrapper">
          <ul class="tabs" data-tab="">
              <li data-name="stats" class="side-nav-tab stats-tab larger-tab
                survey-fire active" data-survey-key="stats-tab">
                  <a href="#panel2-1" style="display: block;"
                    aria-selected="true" tabindex="0">Stats</a>
              </li>
          </ul>
      </div>
      </div>
      <div class="tabs-content-container">
        <div class="tabs-content no-bottom">
          <div class="content livestats-container active" id="panel2-1"
              aria-hidden="false">
            <div class="teams-container">
              <div id="ember1176" class="ember-view tse-scrollable">
                <div class="tse-scrollbar" style="display: block;">
                  <div class="drag-handle" style="top: 2px; height: 354px;">
                  </div>
                </div>
                <div class="tse-scroll-content" style="width:391px;
                    height: 539px;">
                  <div class="tse-content">
                    <div id="ember1190" class="ember-view team-matchup">
                      <div class="team-matchup-teams-section">
                        <div class="team-matchup-blue-team">
                        </div>
                        <div class="team-matchup-red-team">
                        </div>
                        <span class="clearfix"></span>
                      </div>
                    </div>
                    <div class="teams">
                    </div>
                    <div id="ember1183" class="ember-view">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  let id = document.location.href.match(/\/vod\/(\d+)\//)[1];
  let teams = (await browser.storage.local.get(id))[id].data.event.match.teams;

  let selectors = ['.team-matchup-blue-team', '.team-matchup-red-team']
  selectors.forEach(async (item, index) => {
    (await getElementBySelector(item)).innerHTML = `
      <div class="team-logo" style="background-size: contain; background-repeat:
        no-repeat; background-image: url(https://am-a.akamaihd.net/image/?f=${teams[index].image}&amp;resize=55:55);">
      </div>
      <div class="acronym-record">
        <div class="team-acronym">
          ${teams[index].code}
        </div>
      </div>`;
  });
}

init();