/*
    nptum core js
*/

// load Handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

// var rows_hbs   = $("#rows-template").html();
// var rows = Handlebars.compile(rows_hbs);



function loadCard(title, body, actions) {
    // actions are optional
    if (typeof actions === "undefined") {actions = "";}

    var context = {
        card_title: title,
        card_content: body,
        card_actions: actions
    };
    var html = cards(context);
    $("#cards").append(html);
}

loadCard("hello", `I am a very simple card.
I am good at containing small bits of information.
I am convenient because I require little markup to use effectively.`);

loadCard("hello", `I am a very simple card.
I am good at containing small bits of information.
I am convenient because I require little markup to use effectively.`);

loadCard("hello", `I am a very simple card.
I am good at containing small bits of information.
I am convenient because I require little markup to use effectively.`);

loadCard("hello", `I am a very simple card.
I am good at containing small bits of information.
I am convenient because I require little markup to use effectively.`);
