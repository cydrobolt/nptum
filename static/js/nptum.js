/*
    nptum core js
*/

// Set constants
const A_MAX_ITEMS_PER_ROW = 2;

// :oad Handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

var modals_hbs   = $("#modals-template").html();
var modals = Handlebars.compile(modals_hbs);

var rows_hbs   = $("#rows-template").html();
var rows = Handlebars.compile(rows_hbs);

var cards_elem = $('#cards');

function openNewNoteModal() {
    var html = modals();
    $('body').append(html);
    $('#new-item-modal').openModal();

    // $('#new-item-modal').remove();
}

function deleteCard(id) {
    $('#'+id).remove();
    var cards_last_elem = cards_elem.last();
    if (cards_last_elem.size() === 0) {
        cards_last_elem.remove();
    }
}

function createNewRow() {
    var new_row = rows();
    cards_elem.append(new_row);
}

function loadCard(title, body, actions) {
    // actions are optional
    if (typeof actions === "undefined") {actions = "";}

    var last_row = $('.row').last();

    if ( (!last_row.hasClass('row') ) || (last_row.size() > A_MAX_ITEMS_PER_ROW) ) {
        // no rows left, create new row
        createNewRow();
    }

    var context = {
        card_title: title,
        card_content: body,
        card_actions: actions
    };
    var html = cards(context);

    last_row.append(html);
}

loadCard("Note to selfa", `Note to self:<ul>
<li>Learn Rust</li>
<li>Learn Iron</li>
<li>Learn how to use Sessions with Iron</li>
<li>Fix the issue with rows not being same size</li>
<li>ffff</li>
</ul>`);

loadCard("Note to self", `Note to self:<ul>
<li>Learn Rust</li>
<li>Learn Iron</li>
<li>Learn how to use Sessions with Iron</li>
<li>Fix the issue with rows not being same size</li>
</ul>`);

loadCard("Note to self", `Note to self:<ul>
<li>Learn Rust</li>
<li>Learn Iron</li>
<li>Fix the issue with rows not being same size</li>
<li>Learn how to use Sessions with Iron</li>
ddddddddddddd
</ul>`);

loadCard("Note to self", `Note to self:<ul>
<li>Learn Rust</li>
<li>Learn Iron</li>
<li>Learn how to use Sessions with Iron</li>
</ul>`);
