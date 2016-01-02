/*
    nptum core js
*/

// Set constants
const A_MAX_ITEMS_PER_ROW = 2;
const A_DEFAULT_MODAL_ROWS = 1;

// Global notes array
window.notes = {};

// Load Handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

var rows_hbs   = $("#rows-template").html();
var rows = Handlebars.compile(rows_hbs);

var modal_rows_hbs   = $("#modal-rows-template").html();
var modal_rows = Handlebars.compile(modal_rows_hbs);

var cards_elem = $('#cards');

// Download initial note data
getRemoteNoteData();

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

function encodeListToJson() {

}

function encodeListToHtml(items_list) {
    var markup = "<ul>";
    items_list.forEach(function (ele, ind, arr) {
        markup += "<li>" + ele + "</li>";
    });
    markup += "</ul>";
    return markup;
}

function getNotesDump() {
    var notes_json = JSON.stringify(window.notes);
    return notes_json;
}

function performSync() {
    var notes_data = {
        notes_dump: getNotesDump()
    };

    $.ajax({
        url: "/api/v1/sync_note_data",
        method: "PUT",
        data: notes_data
    }).done(function() {
        Materialize.toast('Sync complete.', 4000, 'green');
    }).fail(function () {
        Materialize.toast('Sync failed.', 4000, 'red');
    });
}

function reloadLocalNotes() {
    for (key in window.notes) {
        var ele = window.notes[key];

        var markup = encodeListToHtml(ele.contents);
        loadCard(ele.title, markup, key);
    }
}

function getRemoteNoteData() {
    $.ajax({
        url: "/api/v1/get_note_data",
        method: "GET"
    }).done(function(data) {
        window.notes = JSON.parse(data);
        reloadLocalNotes();
        Materialize.toast('Note download complete.', 4000, 'green');
    }).fail(function () {
        Materialize.toast('Note download failed.', 4000, 'red');
    });
}

function loadCard(title, body, id, actions) {
    // actions are optional
    if (typeof actions === "undefined") {actions = "";}
    if (typeof id === "undefined") {id = false;}


    var last_row = $('.row').last();

    if (!id) {
        id = guid();
    }

    if ( (!last_row.hasClass('row') ) || (last_row.children().size() >= A_MAX_ITEMS_PER_ROW) ) {
        // no rows left, create new row
        createNewRow();
    }

    var context = {
        card_id: id,
        card_title: title,
        card_content: body,
        card_actions: actions
    };
    var html = cards(context);

    last_row = $('.row').last();
    last_row.append(html);

    return id;
}

$('#save-new-note').click(function () {
    var title = $('#new-note-title').val();
    var new_note_items = [];

    $('.modals-row').each(function () {
        // single row data
        var note_item_value = $(this).val();
        if (note_item_value !== "") {
            new_note_items.push(note_item_value);
        }
    });

    var note_markup = encodeListToHtml(new_note_items);
    var id = loadCard(title, note_markup);

    window.notes[id] = {
        title: title,
        contents: new_note_items
    };
    performSync();
});

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

$('#login-modal-trigger').leanModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: 0.5, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
     ready: function() {

     }, // Callback for Modal open
     complete: function() {

     } // Callback for Modal close
   }
);

$('#add-row-in-modal').click(function () {
    var html = modal_rows();
    $('#modal-rows-list').append(html);
});

$("#perform-sync").click(function () {
    performSync();
});

$('body').delegate('#delete-modal-row', 'click', function () {
    $(this).parent().parent().remove();
});

$('body').delegate('#delete-card', 'click', function () {
    // TODO: automatically restructure rows
    var id = $(this).parent().data('id');
    delete window.notes[id];
    $(this).parent().parent().parent().remove();
    performSync();
});
