////////// Shared code (client and server) //////////

BOARD_ROWS = 25;
BOARD_COLS = 40;
PLAYER_COLORS = ["blue", "red", "yellow", "green", "orange", "pink"]
CAPITALS = 5;
CRITTERS = ["reef"];

Games = new Meteor.Collection('games');
// board: array of arrays of associative arrays
//        with schema:
//            land        - boolean, whether or not land
//            owner_color - string, color of the owner of the piece
//            critter     - string, type of critter
//            critter_id  - id

Words = new Meteor.Collection('words');

Players = new Meteor.Collection('players');
// {name: 'matt',
//  game_id: 123,
//  color: "blue"
//  }

Critters = new Meteor.Collection('critters');
// {player_id: 123, critter: "name"}

var ADJACENCIES = [];
for (var row = 0; row < BOARD_ROWS; row++) {
    var current = [];
    for (var col = 0; col < BOARD_COLS; col++) {
        var adjacent = [];
        adjacent.push([row, col]);
        adjacent.push([row, col == BOARD_COLS - 1 ? 0 : col + 1]);
        adjacent.push([row, col == 0 ? BOARD_COLS - 1 : col - 1]);
        if (row != 0) {
            adjacent.push([row - 1, col]);
        }
        if (row != BOARD_ROWS - 1) {
            adjacent.push([row + 1, col]);
        }
        current.push(adjacent);
    }
    ADJACENCIES.push(current);
}

randi = function (i) {
    return Math.floor(Math.random() * i);
}

Meteor.methods({
  score_word: function (word_id) {
    // check(word_id, String);
    // var word = Words.findOne(word_id);
    // var game = Games.findOne(word.game_id);

    // // client and server can both check that the game has time remaining, and
    // // that the word is at least three chars, isn't already used, and is
    // // possible to make on the board.
    // if (game.clock === 0
    //     || !word.word
    //     || word.word.length < 3
    //     || Words.find({game_id: word.game_id, word: word.word}).count() > 1
    //     || paths_for_word(game.board, word.word).length === 0) {
    //   Words.update(word._id, {$set: {score: 0, state: 'bad'}});
    //   return;
    // }

    // // now only on the server, check against dictionary and score it.
    // if (Meteor.isServer) {
    //   if (_.has(DICTIONARY, word.word.toLowerCase())) {
    //     var score = Math.pow(2, word.word.length - 3);
    //     Words.update(word._id, {$set: {score: score, state: 'good'}});
    //   } else {
    //     Words.update(word._id, {$set: {score: 0, state: 'bad'}});
    //   }
    // }
  }
});


if (Meteor.isServer) {
    // TODO might be useful for reading a file (in the private folder)
    // DICTIONARY = {};
    // _.each(Assets.getText("enable2k.txt").split("\n"), function (line) {
    //     // Skip blanks and comment lines
    //     if (line && line.indexOf("//") !== 0) {
    //         DICTIONARY[line] = true;
    //     }
    // });


  // publish all the non-idle players.
  Meteor.publish('players', function () {
    return Players.find({idle: false});
  });

  // publish single games
  Meteor.publish('games', function (id) {
    check(id, String);
    return Games.find({_id: id});
  });

  // TODO copy for moves
  // publish all my words and opponents' words that the server has
  // scored as good.
  // Meteor.publish('words', function (game_id, player_id) {
  //   check(game_id, String);
  //   check(player_id, String);
  //   return Words.find({$or: [{game_id: game_id, state: 'good'},
  //                            {player_id: player_id}]});
  // });
}
