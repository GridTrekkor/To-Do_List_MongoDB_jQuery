$(function() {

    var NoteNumber = 0, ItemNumber = 0, NoteID = 0;
    var ItemID, Title, NoteColor, Checked;

    // define available note colors
    var NoteColors = [ "rgb(255, 253, 199)", "rgb(230, 253, 199)", "rgb(255, 226, 199)", "rgb(231, 217, 255)", "rgb(199, 253, 255)", "rgb(255, 226, 226)" ];
    function getDate() { return new Date(); }
    function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    // hide or show Add Note button depending on current note count
    function checkNumOfNotes() {
        if ($(".note").length >= 6)
            $("#addNote").hide();
        else
            $("#addNote").show();
    }

    // apply checked or unchecked state to checkmark images and item text
    function checkState(ItemID, Checked) {
        if (Checked) {
            $(".listItem").filter("[data-itemid=" + ItemID + "]").css({"text-decoration": "line-through"});
            //$(".checkItem").filter("[data-itemid=" + ItemID + "]").css("opacity", "1");
        } else {
            $(".listItem").filter("[data-itemid=" + ItemID + "]").css({"text-decoration": "none"});
            //$(".checkItem").filter("[data-itemid=" + ItemID + "]").css("opacity", "0.2");
        }
    }

    // initial ajax call to get existing notes
    $.ajax({
        dataType: 'json',
        method: "GET",
        url: "/notes/getNotes"
    }).done(function(response) {
        displayNotes(response);
    });

    // generic ajax function for all POST requests
    function makeAjaxPost(url, data) {
        $.ajax({
            dataType: 'json',
            method: "POST",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(data),
            success: function (response) {
                console.log(response);
            }
        });
    }

    // append existing or new note
    function appendNote(NoteNumber, NoteID, NoteColor, Title, NewNote) {

        $("#mainContainer").append(newNote(NoteNumber, NoteID, NoteColor));
        var $note = $(".note[data-notenumber=" + NoteNumber + "]");
        $note.append("<h2><span class='noteTitle' data-titlenumber='" + NoteNumber + "'>" + Title + "</span></h2>");
        $note.append("<div class='addItem' data-notenumber='" + NoteNumber + "'><img src='images/add.png' />Add Item</div>");
        $note.append("<div class='deleteNote' title='Delete Note'><img src='images/delete.png' /></div>");
        $note.append("<ul class='itemContainer' data-notenumber='" + NoteNumber + "'></ul>");
        inputEvents($("h2 > span[data-titlenumber=" + NoteNumber +"]"), "titleInput", NoteID);
        // remove this note's color from available colors
        NoteColors.splice($.inArray(NoteColor, NoteColors), 1);

        // build new note data
        if (NewNote) {
            var newNoteData = {};
            newNoteData.NoteID = $note.data("noteid");
            newNoteData.Title = Title;
            newNoteData.Color = $note.css("background-color");
            makeAjaxPost("/notes/addNote", newNoteData);
        }

    }

    // output all notes returned from database
    function displayNotes(response) {
        while (NoteNumber < response.length) {
            NoteID = response[NoteNumber].NoteID;
            Title = response[NoteNumber].Title;
            NoteColor = response[NoteNumber].Color;

            // append note to screen
            appendNote(NoteNumber, NoteID, NoteColor, Title, false);

            // get any and all items within current note
            ItemNumber = 0;
            while (ItemNumber < response[NoteNumber].Items.length) {
                ItemID = response[NoteNumber].Items[ItemNumber].ItemID;
                Title = response[NoteNumber].Items[ItemNumber].Title;
                Checked = response[NoteNumber].Items[ItemNumber].Checked;
                $("ul[data-notenumber=" + NoteNumber + "]").append("<li data-itemid='" + ItemID + "' data-noteid='" + NoteID + "'><img class='deleteItem' title='Delete Item' src='images/delete.png' data-noteid='" + NoteID + "' data-itemid='" + ItemID + "'/><img class='checkItem' src='images/check.png' data-itemid='" + ItemID + "' data-noteid='" + NoteID + "' /><span class='listItem' data-itemid='" + ItemID + "'>" + Title + "</span></li>");
                inputEvents($("li[data-itemid=" + ItemID +"] > .listItem"), "itemInput", NoteID, ItemID);
                if (Checked) checkState(ItemID, Checked);
                ItemNumber++;
            }
            NoteNumber++;
        }
        checkNumOfNotes();
    }

    // handle inline edit for item passed in
    function inputEvents(inputField, itemClass, NoteID, ItemID) {
        var replaceWith = $("<input name='temp' type='text' class='" + itemClass + "' />"),
        connectWith = $("input[name='hiddenField']");
        inputField.inlineEdit(replaceWith, connectWith, NoteID, ItemID);
    }

    // add note click handler
    $("#addNote").on("click", function() {
        if (!NoteNumber) NoteNumber = 0;
        appendNote(NoteNumber, getRandomInt(10000000, 99999999), NoteColors[0], "Note", true);
        NoteNumber++;
        checkNumOfNotes();
    });

    // add new note
    var newNote = function(NoteNumber, NoteID, NoteColor) {
        // if no NoteColor is specified, get the first available color
        if (!NoteColor) NoteColor = NoteColors[0];
        // return note div
        return "<div class='note' style='background-color:" + NoteColor + "' data-notenumber='" + NoteNumber + "' data-noteid='" + (NoteID ? NoteID : getRandomInt(10000000, 99999999)) + "'></div>";
    };

    // add new item
    $(document).on("click", ".addItem", function() {
        ItemID = getRandomInt(10000000, 99999999);
        NoteID = $(this).parent("div").data("noteid");
        //console.log("NoteID = " + NoteID + " : ItemID = " + ItemID);
        var noteAddNumber = $(this).attr("data-notenumber");
        $("ul[data-notenumber=" + (noteAddNumber) + "]").append("<li data-itemid='" + ItemID + "' data-noteid='" + NoteID + "'><img class='deleteItem' src='images/delete.png' data-noteid='" + NoteID + "' data-itemid='" + ItemID + "'/><img class='checkItem' title='Check Item' src='images/check.png' data-itemid='" + ItemID + "' data-noteid='" + NoteID + "' /><span class='listItem' data-itemid='" + ItemID + "'>List item</span></li>");
        inputEvents($("li[data-itemid=" + ItemID +"] > .listItem"), "itemInput", NoteID, ItemID);
        var newItemData = {};
        newItemData.NoteID = $(this).parent("div").data("noteid");
        newItemData.ItemID = ItemID;
        newItemData.Title = "List item";
        newItemData.DateCreated = getDate();
        newItemData.Checked = false;
        makeAjaxPost("/notes/addItem", newItemData);
    });

    // delete note
    var deleteNote = $(document).on("click", ".deleteNote", function() {
        $(this).parent("div").remove();

        // prepare delete data for ajax call; only the note ID is needed
        var deleteNoteData = {};
        deleteNoteData.NoteID = $(this).parent("div").data("noteid");
        makeAjaxPost("/notes/deleteNote", deleteNoteData);

        // get color of deleted note and put it back in available colors
        NoteColors.push($(this).parent("div").css("background-color"));
        checkNumOfNotes();
    });

    // (un)check item
    var checked = false;
    $(document).on("click", ".checkItem", function() {
        //checkState($(this));

        if (!checked) {
            $(this).closest("li").find("span").css({ "text-decoration" : "line-through" });
            $(this).addClass('checkItemSelected');
            checked = true;
        } else {
            $(this).closest("li").find("span").css("text-decoration", "none");
            $(this).removeClass('checkItemSelected');
            checked = false;
        }
        var checkedData = {};
        checkedData.NoteID = $(this).data("noteid");
        checkedData.ItemID = $(this).data("itemid");
        checkedData.Checked = checked;
        makeAjaxPost("/notes/checkItem", checkedData);
    });

    // delete item
    $(document).on("click", ".deleteItem", function() {
        $(this).closest("li").remove();
        var deleteItemData = {};
        deleteItemData.NoteID = $(this).data("noteid");
        deleteItemData.ItemID = $(this).data("itemid");
        makeAjaxPost("/notes/deleteItem", deleteItemData);
    });


    /******************************************************************************************************************/

    // inline edit functionality & note/item title edit
    $.fn.inlineEdit = function(replaceWith, connectWith, NoteID, ItemID) {

        $(this).hover(function() {
            $(this).addClass('hover');
        }, function() {
            $(this).removeClass('hover');
        });

        $(this).on("click", function() {
            var elem = $(this);
            elem.hide();
            elem.after(replaceWith);
            replaceWith.focus();
            replaceWith.select();

            // blur with mouse
            replaceWith.blur(function() {
                if ($(this).val() != "") {
                    connectWith.val($(this).val()).change();
                    elem.text($(this).val());
                }
                $(this).remove();
                elem.show();
                // call updatePost function with element type, new text value, NoteID, and ItemID* (* - if necessary)
                doUpdatePost(elem[0].className, elem[0].innerText, NoteID, ItemID);
            });

            // capture ENTER key for blur and call replaceWith()
            $(document).keydown(function(e) {
                if(e.which == 13) replaceWith.blur();
            });

            // update note title or item title
            function doUpdatePost(tagType, NewTitle, NoteID, ItemID) {
                var url;
                if (tagType == "noteTitle")
                    url = "/notes/editNoteTitle";
                else
                    url = "/notes/editItemTitle";

                var updatedNoteData = {};
                updatedNoteData.NoteID = NoteID;
                if (ItemID) updatedNoteData.ItemID = ItemID;
                updatedNoteData.Title = NewTitle;
                makeAjaxPost(url, updatedNoteData);
            }

        });

    };

});