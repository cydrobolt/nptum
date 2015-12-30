/*
    nptum core js
*/

// Set constants
const A_MAX_ITEMS_PER_ROW = 2;
const A_DEFAULT_MODAL_ROWS = 1;

// Load Handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

var rows_hbs   = $("#rows-template").html();
var rows = Handlebars.compile(rows_hbs);

var modal_rows_hbs   = $("#modal-rows-template").html();
var modal_rows = Handlebars.compile(modal_rows_hbs);

var cards_elem = $('#cards');

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

    if ( (!last_row.hasClass('row') ) || (last_row.children().size() >= A_MAX_ITEMS_PER_ROW) ) {
        // no rows left, create new row
        createNewRow();
    }

    var context = {
        card_title: title,
        card_content: body,
        card_actions: actions
    };
    var html = cards(context);

    last_row = $('.row').last();
    last_row.append(html);
}

$('#new-item-modal-trigger').leanModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: 0.5, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
     ready: function() {
        for (var i=0;i<A_DEFAULT_MODAL_ROWS;i++) {
            $('#modal-rows-list').append(
                modal_rows()
            );
        }
     }, // Callback for Modal open
     complete: function() {
         // clean up modal inputs
         $('#new-note-title').val("");
         $('#new-note-content').val("");
         $('#modal-rows-list').empty();
     } // Callback for Modal close
   }
 );

$('#add-row-in-modal').click(function () {
    var html = modal_rows();
    $('#modal-rows-list').append(html);
});

$('body').delegate('#delete-modal-row', 'click', function () {
    $(this).parent().parent().remove();
});

$('body').delegate('#delete-card', 'click', function () {
    // TODO: automatically restructure rows
    $(this).parent().parent().parent().remove();
});

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
<li>Learn how to use Sessions with Iron</li
</ul>`);

loadCard("Note to self", `Note to self:<ul>
<li>Learn Rust</li>
<li>Learn Iron</li>
<li>Learn how to use Sessions with Iron</li>
</ul>`);
