function addListener() {
  /* beautify ignore:start */
  browser.webNavigation.onHistoryStateUpdated.addListener(
    listener,
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

async function listener(result) {
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

function getEventDetails(id) {
  let baseUrl = 'https://prod-relapi.ewp.gg/persisted/gw';
  let url = `${baseUrl}/getEventDetails?hl=en-GB&id=${id}`;

  let options = {
    headers: {
      'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
    }
  };
  return fetch(url, options);
}

function getMatchDetails(youtubeId) {
  let url = `https://slick.co.ke/v1/lolesports/${youtubeId}`;
  return fetch(url);
}

function save(key, value) {
  browser.storage.local.set({
    [key]: value
  });
}

async function saveData(id) {
  let eventDetails = await (await getEventDetails(id)).json();
  save(id, eventDetails);

  let games = eventDetails.data.event.match.games;
  let filteredGames = games.filter(game => game.state === 'completed');
  let requests = filteredGames.map(game => {
    for (let vod of game.vods) {
      if (vod.provider === 'youtube') {
        return getMatchDetails(vod.parameter);
      }
    }
  });

  let responses = await Promise.all(requests);
  let matchDetailsArray = await Promise.all(
    responses.map(response => response.json()));

  games.forEach((game, index) => {
    if (index <= matchDetailsArray.length - 1) {
      game['details'] = matchDetailsArray[index]
    }
  });
  save(id, eventDetails);
}

addListener();