const Game = require('../../app/core/game');
const firebase = require('../../app/services/firebase').getFirebaseClient();
const _ = require('lodash');
const assert = require('assert');

const kill = (gameId, players, role) => {
  const killables = _(players).filter(p => p.role === role && p.status !== 'DEAD').value();
  if (killables.length > 0) {
    const death = killables[0].name;
    return firebase.database().ref().child(`games/${gameId}/rounds/current/phase/subPhase`).update({ death });
  }
  return Promise.resolve();
};

const assertWon = (game, done, status) => {
  console.log(_.map(game.players, p => `${p.name}\t\t${p.role}\t${p.status}`).join('\n'));
  if (game.status === status) {
    console.log(game.status);
    done();
  } else {
    done(new Error(`${game.status} !== ${status}`));
  }
};

describe('Game', () => {
  const gamesToDelete = [];

  it('Villagers should win !', (done) => {
    const deviceId = 'test_1';
    new Game(deviceId).start()
    .then((game) => {
      gamesToDelete.push(game.id);
      console.log(`= Game: ${game.id}`);
      return game.associateUserIdToGame()
      .then(() => Game.loadByDeviceId(deviceId))
      .then(() => game.createPlayer('julien_'))
      .then(() => game.createPlayer('qian_'))
      .then(() => game.createPlayer('benjamin_'))
      .then(() => game.createPlayer('pablo_'))
      .then(() => game.createPlayer('michael_'))
      .then(() => game.distributeRoles())
      .then(() => game.waitForPlayersToBeReady())
      .then(() => firebase.database().ref().child(`games/${game.id}/players/pablo_`).update({ status: 'READYX' }))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/pablo_`).update({ status: 'READY' }))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/benjamin_`).update({ status: 'READY' }))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/qian_`).update({ status: 'READY' }))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/michael_`).update({ status: 'READY' }))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/julien_`).update({ status: 'READY' }))
      .then(() => {
        setTimeout(() => firebase.database().ref().child(`games/${game.id}/rounds/current/phase/subPhase/votes/qian_`).set({ voted: 'benjamin_' }), 2000);
        setTimeout(() => firebase.database().ref().child(`games/${game.id}/rounds/current/phase/subPhase/votes/pablo_`).set({ voted: 'benjamin_' }), 3000);
        setTimeout(() => firebase.database().ref().child(`games/${game.id}/rounds/current/phase/subPhase/votes/benjamin_`).set({ voted: 'pablo_' }), 4000);
        setTimeout(() => firebase.database().ref().child(`games/${game.id}/rounds/current/phase/subPhase/votes/julien_`).set({ voted: 'pablo_' }), 5000);

        // setTimeout(() => Game.loadById(game.id).then(_game => kill(game.id, _game.players, 'VILLAGER')), 2200);
        setTimeout(() => Game.loadById(game.id).then(_game => assertWon(_game, done, 'VILLAGERS_VICTORY')), 8000);
      })
      .catch(done);
    });
  });

  /*it('Werewolves should win !', (done) => {
   const deviceId = 'test_2';
   new Game(deviceId).start()
   .then((game) => {
   gamesToDelete.push(game.id);
   console.log(`= Game: ${game.id}`);
   return game.associateUserIdToGame()
   .then(() => Game.loadByDeviceId(deviceId))
   .then(() => game.createPlayer('julien'))
   .then(() => game.createPlayer('qian'))
   .then(() => game.createPlayer('benjamin'))
   .then(() => game.createPlayer('pablo'))
   .then(() => game.createPlayer('michael'))
   .then(() => game.distributeRoles())
   .then(() => game.waitForPlayersToBeReady())
   .then(() => firebase.database().ref().child(`games/${game.id}/players/pablo`).update({status: 'READYX'}))
   .then(() => firebase.database().ref().child(`games/${game.id}/players/pablo`).update({status: 'READY'}))
   .then(() => firebase.database().ref().child(`games/${game.id}/players/benjamin`).update({status: 'READY'}))
   .then(() => firebase.database().ref().child(`games/${game.id}/players/qian`).update({status: 'READY'}))
   .then(() => firebase.database().ref().child(`games/${game.id}/players/michael`).update({status: 'READY'}))
   .then(() => firebase.database().ref().child(`games/${game.id}/players/julien`).update({status: 'READY'}))
   .then(() => {
   setTimeout(() => Game.loadById(game.id).then(_game => kill(game.id, _game.players, 'VILLAGER')), 2000);
   setTimeout(() => Game.loadById(game.id).then(_game => kill(game.id, _game.players, 'WEREWOLF')), 4000);
   setTimeout(() => Game.loadById(game.id).then(_game => kill(game.id, _game.players, 'VILLAGER')), 6000);
   setTimeout(() => Game.loadById(game.id).then(_game => kill(game.id, _game.players, 'VILLAGER')), 8000);
   setTimeout(() => Game.loadById(game.id).then(_game => assertWon(_game, done, 'WEREWOLVES_VICTORY')), 10000);
   })
   .catch(done);
   });
   });*/

  /*after(() => {
   const promises = []
   gamesToDelete.forEach(
   gameId => promises.push(firebase.database().ref().child(`games/${gameId}`).remove())
   )
   promises.push(firebase.database().ref().child(`devices/test_1`).remove());
   promises.push(firebase.database().ref().child(`devices/test_2`).remove());
   return Promise.all(promises);
   });*/
});
