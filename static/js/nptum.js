/*
    nptum core js
*/

// load handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

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
