////////// Server only logic //////////

new_board = function (p) {
    // generate board with random land
    var board = [];
    for (var i = 0; i < BOARD_ROWS; i++) {
        var row = [];
        for (var j = 0; j < BOARD_COLS; j++) {
            row.push({
                num: i * BOARD_COLS + j,
                land: Math.random() < 0.1,
                capital: false
            });
        }
        board.push(row)
    }

    // generate random capitals
    _.map(_.range(CAPITALS), function(i) {
        while (true) {
            var row = randi(BOARD_ROWS);
            var col = randi(BOARD_COLS);
            board[row][col].land = false;
            board[row][col].capital = true;
        }
    });
    return board;
};

add_critter = function(player_id, critter, row, col) {
    var player = Players.findOne({_id: player_id});
    var game_id = player.game_id;
    var board = Games.findOne({_id: game_id}).board;
    var critter_id = Critters.insert({
        critter: critter,
        player_id: player_id,
        game_id: game_id
        // TODO add next move time, health
    });
    board[row][col].critter_id = critter_id;
    board[row][col].critter = critter;
    board[row][col].owner_color = player.color;
    Games.update({_id: game_id}, {board: board})
}

remove_critter = function(game_id, row, col) {
    var board = Games.findOne({_id: game_id}).board;
    Critters.remove({_id: board[row][col].critter_id});
    delete board[row][col].critter;
    delete board[row][col].critter_id;
    delete board[row][col].owner_color;
    Games.update({_id: game_id}, {board: board})
}

add_starting_critters = function(board, players) {
    _.map(_.range(players.length), function(i) {
        var row;
        var col;
        var tmp;
        do {
            row = randi(BOARD_ROWS);
            col = randi(BOARD_COLS);
            tmp = board[row][col];
        } while (tmp.land || tmp.capital)
        // TODO make players start at capitals
        // board[row][col].capital = true;
        add_critter(players[i]._id, CRITTERS[0], row, col);
    });
}

Meteor.methods({
    start_new_game: function () {
        // find list of player ids who will join this game
        var p = Players.find({game_id: null, idle: false, name: {$ne: ''}},
                                   {fields: {_id: true}}).fetch();

        // need at least one player
        if (p.length < 2) {
            return;
        }

        // take only enough players such that each has a unique color
        p = p.slice(0, PLAYER_COLORS.length);

        // give players colors
        _.map(_.range(p.length), function(i) {
            p[i].color = PLAYER_COLORS[i];
        });

        // generate board
        var board = new_board(p);

        // create a new game w/ fresh board
        var game_id = Games.insert({board: board});

        // update player color and game_id
        _.map(p, function(player) {
            player.game_id = game_id;
            Players.update({_id: player._id}, player);
        });

        // add starting critters
        add_starting_criters(game_id, board, players);

        return game_id;
    },


    keepalive: function (player_id) {
        check(player_id, String);
        Players.update({_id: player_id},
                       {$set: {last_keepalive: (new Date()).getTime(),
                               idle: false}});
    }
});

Meteor.setInterval(function () {
    var now = (new Date()).getTime();
    var idle_threshold = now - 70*1000; // 70 sec
    var remove_threshold = now - 60*60*1000; // 1hr

    // database query that sets player as idle
    Players.update({last_keepalive: {$lt: idle_threshold}},
                   {$set: {idle: true}});

    // XXX need to deal with people coming back!
    Players.remove({$lt: {last_keepalive: remove_threshold}});

}, 30*1000);
