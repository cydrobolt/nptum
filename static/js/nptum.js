/*
    nptum core js
*/

// Set constants
const A_MAX_ITEMS_PER_ROW = 2;
const A_DEFAULT_MODAL_ROWS = 1;

const A_COLORS = [
    "blue-grey",
    "red",
    "orange",
    "yellow",
    "blue",
    "purple"
];

const H_CHECK = '<i class="fa fa-check"></i>';

// Backbone model
var NoteStore = Backbone.Model.extend({
    initialize: function() {
        this.ifEmptyBackground();

        this.on("change", function () {
            performSync();
            reloadLocalNotes();
            this.ifEmptyBackground();
        });
    },
    addNote: function(id, title, contents, color) {
        this.set(id, {
            title: title,
            contents: contents,
            color: color
        });
    },
    delete: function(id) {
        this.unset(id);
    },
    ifEmptyBackground: function() {
        var status_elem = $('#status');
        if (Object.keys(this.attributes).length === 0) {
            // if no notes set
            status_elem.html('<h1 class="muted">No notes. Why don\'t you try creating some?');
        }
        else {
            status_elem.empty();
        }
    }
});

// Global notes model

window.notes = false;
window.new_item_color = "blue-grey";

// Load Handlebars templates
var cards_hbs   = $("#cards-template").html();
var cards = Handlebars.compile(cards_hbs);

var rows_hbs   = $("#rows-template").html();
var rows = Handlebars.compile(rows_hbs);

var modal_rows_hbs   = $("#modal-rows-template").html();
var modal_rows = Handlebars.compile(modal_rows_hbs);

var color_picker_hbs   = $("#color-picker-item-template").html();
var color_picker_item = Handlebars.compile(color_picker_hbs);

var cards_elem = $('#cards');

// Download initial note data only if logged in
if (loggedIn) {
    getRemoteNoteData();
}

// Load colors

A_COLORS.forEach(function (ele, ind, arr) {
    var item = color_picker_item({
        "color": ele
    });
    $('.color-picker-wrapper').append(item);
});
$('.color-picker').first().html(H_CHECK);


function createNewRow() {
    var new_row = rows();
    cards_elem.append(new_row);
}

function encodeListToHtml(items_list) {
    var markup = "<ul>";
    items_list.forEach(function (ele, ind, arr) {
        markup += "<li>" + escapeHtml(ele) + "</li>";
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
    // clear current cards
    $("#cards").empty();

    for (key in window.notes.attributes) {
        var ele = window.notes.get(key);

        var markup = encodeListToHtml(ele.contents);
        loadCard(ele.title, markup, key, ele.color);
    }
}

function getRemoteNoteData() {
    $.ajax({
        url: "/api/v1/get_note_data",
        method: "GET"
    }).done(function(data) {
        window.notes = new NoteStore(
            JSON.parse(data)
        );
        reloadLocalNotes();
        Materialize.toast('Ready!', 4000, 'blue');
    }).fail(function () {
        window.notes = new NoteStore();
    });
}

function loadCard(title, body, id, color, actions) {
    // actions are optional
    if (typeof actions === "undefined") {actions = '';}
    if (typeof id === "undefined") {id = false;}
    if (typeof color === "undefined") {color = 'blue-grey';}


    var last_row = $('.row').last();

    if (!id) {
        id = guid();
    }

    if ( (!last_row.hasClass('row') ) || (last_row.children().size() >= A_MAX_ITEMS_PER_ROW) ) {
        // no rows left, create new row
        createNewRow();
    }

    var context = {
        card_id: escapeHtml(id),
        card_title: title,
        card_content: body,
        card_actions: actions,
        card_color: escapeHtml(color)
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
    var id = loadCard(title, note_markup, undefined, new_item_color);

    window.notes.addNote(id, title, new_note_items, new_item_color);
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
    var id = $(this).parent().data('id');
    $(this).parent().parent().parent().remove();
    window.notes.delete(id);
});

$('body').delegate('.color-picker', 'click', function () {
    $('.color-picker').each(function() {
        $(this).html('&nbsp;&nbsp;');
    });
    $(this).html(H_CHECK);
    window.new_item_color = $(this).data('color');
});
