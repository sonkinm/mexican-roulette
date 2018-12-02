const TeleBot = require('telebot');
        config = require('./config.json'),
        token = config.token;
const bot = new TeleBot(token);
var chatID = new Set();
var games = new Map();
var drinks = new Map();

function card(value, name, suit) {
    this.value = value;
    this.name = name;
    this.suit = suit;
}

function deck() {
    this.names = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.suits = ['♥','♦','♠','♣'];
    cards = [];

    for( var s = 0; s < this.suits.length; s++ ) {
        for( var n = 0; n < this.names.length; n++ ) {
            cards.push( new card( n+1, this.names[n], this.suits[s] ) );
        }
    }
    shuffle(cards);
    return cards;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function nextCard(deck) {
    if (deck.length > 0) {
        return deck.pop();
    } 
}

function cardsLeft(deck) {
    return deck.length;
}

function getRound(deck) {
    if (deck.length < 4) {
        return 4;
    } else if (deck.length < 14) {
        return 3;
    } else if (deck.length < 29) {
        return 2;
    } else {
        return 1;
    }
}

bot.on('/start', msg => {
    chatID.add(msg.chat.id);
    return msg.reply.text("Bot started");
});

bot.on('/stop', msg => {
    chatID.delete(msg.chat.id);
    return msg.reply.text("Bot stopped");
});

bot.on('/newgame', msg => {
    games.set(msg.chat.id, new deck());
    drinks.set(msg.chat.id, 0);
    return msg.reply.text("Let's go");
})

bot.on('/drawcard', msg => {
    var thisGame = games.get(msg.chat.id);
    if (thisGame.length == 0) {
        return msg.reply.text("The game is over. Start a new game!");
    } else {
        var card = nextCard(thisGame);
        var round = getRound(thisGame);
        var xtratext = "";
        try {
            switch (true) {
                case card.value == 1:
                    xtratext = "Category/Story";
                    break;
                case card.value >= 2 && card.value <=5:
                    xtratext = "Drink " + card.value * round;
                    drinks.set(msg.chat.id, drinks.get(msg.chat.id) + card.value * round);
                    break;
                case card.value >=6 && card.value <=10:
                    xtratext = "Give " + card.value * round + " drinks";
                    drinks.set(msg.chat.id, drinks.get(msg.chat.id) + card.value * round);
                    break;
                case card.value == 11:
                    xtratext = "New rule";
                    break;
                case card.value == 12:
                    xtratext = "Pick a servant";
                    break;
                case card.value == 13:
                    xtratext = "You are the question master";
                    break;
            }
            return msg.reply.text("**Round " + round + "**\n" + "Your card is " + card.name + card.suit + ":\n" + xtratext);
        }
        catch(err) {
            return msg.reply.text("Oops, something went wrong. Try again");
        }
    }
})

bot.on('/cardsleft', msg => {
    return msg.reply.text("There are " + games.get(msg.chat.id).length + " cards left in the deck\n");
})

bot.on('/stats', msg => {
    var thisGame = games.get(msg.chat.id);
    if (thisGame.length == 0) {
        return msg.reply.text("The game is over.\n" + drinks.get(msg.chat.id) + " drinks were consumed during this game");
    }
    return msg.reply.text("It is round " + getRound(thisGame) + "\n" + drinks.get(msg.chat.id) + " drinks have been consumed out during this game");
})

bot.start();
