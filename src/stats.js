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
    'teams': (await data)[id].data.event.match.teams,
    'showSpinner': true
  });
  addStats();

  let videoPlayer = await getElementById('video-player');
  videoPlayer.setAttribute('style', '');

  placeholder.appendChild(videoPlayer);
  (await getElementBySelector('.VideoPlayer')).appendChild(placeholder);

  (await getElementBySelector('.stream-content-container')).appendChild(
    await getElementBySelector('.Footer'));

  nav = await nav;
  (await getElementBySelector('.WatchVod')).appendChild(nav);

  let cookieButton = getElementBySelector(
    '.riotbar-cookie-policy-v2.cookie-link.corner-button');
  let streamSelector = getElementBySelector('.stream-selector');
  nav.insertBefore((await cookieButton), (await streamSelector));
}

async function getIds(id, matchNumber) {
  while (true) {
    let eventDetails = await browser.storage.local.get(id);
    let games = eventDetails[id].data.event.match.games;

    let index = matchNumber - 1;
    if ('details' in games[index]) {
      return eventDetails[id].data.event.match.games[index].details;
    }

    await delay(timeout = 500);
  }
}

async function getMatchDetails(ids) {
  let baseUrl = 'https://api.lolesports.com/api/v2/highlanderMatchDetails?';
  let tournamentId = ids['tournament_id'];
  let matchId = ids['match_id'];
  let url = `${baseUrl}tournamentId=${tournamentId}&matchId=${matchId}`;

  let data = await (await fetch(url)).json();
  let result = {
    'players': data.players,
    'gameIdMappings': data.gameIdMappings
  }

  return result;
}

function getGameHash(gameId, matchDetails) {
  for (let mapping of matchDetails.gameIdMappings) {
    if (mapping.id === gameId) {
      return mapping.gameHash;
    }
  }
}

async function getStats(tournamentId) {
  let baseUrl = 'https://api.lolesports.com/api/v2/tournamentPlayerStats?';
  let url = `${baseUrl}tournamentId=${tournamentId}`;

  let data = await (await fetch(url)).json();
  return data.stats;
}

async function getPlayers(platformId, gameHash) {
  let baseUrl = 'https://acs.leagueoflegends.com/v1/stats/game/';
  let [realm, id] = platformId.split(':');
  let url = `${baseUrl}${realm}/${id}?gameHash=${gameHash}`;

  let data = await (await fetch(url)).json();
  let players = data.participantIdentities.map(identity => {
    let fullName = identity.player.summonerName;
    let [, summonerName] = fullName.split(' ');
    return summonerName;
  });

  return players;
}

async function addStats() {
  let regexPattern = /\/vod\/(\d+)\/(\d{1})\/?/;
  let [, id, matchNumber] = document.location.href.match(regexPattern);

  let ids = await getIds(id, matchNumber);
  let statsPromise = getStats(ids['tournament_id']);
  let matchDetails = await getMatchDetails(ids);

  let gameHash = getGameHash(ids['game_id'], matchDetails);
  let [stats, players] = await Promise.all([
    statsPromise,
    getPlayers(ids['platform_id'], gameHash)
  ]);

  stats = stats.filter(item => players.includes(item.name));

  let playersData = players.map(player => {
    let object = {
      'name': player
    };
    for (let playerInfo of matchDetails.players) {
      if (playerInfo.name === player) {
        object.photoUrl = playerInfo.photoUrl;
        break;
      }
    }
    for (let stat of stats) {
      if (stat.name === player) {
        object.kda = stat.kda.toPrecision(3);

        kp = stat.killParticipation * 100;
        object.kp = kp.toPrecision(2);
        break;
      }
    }

    return object;
  });

  let div = await getElementById('teamStats');
  div.innerHTML = Handlebars.templates['teamStats']({
    'showSpinner': false,
    'blueTeam': playersData.slice(0, 5),
    'redTeam': playersData.slice(5)
  });
}

init();