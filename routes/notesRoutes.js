var express = require('express');
var router = express.Router();
var NotesModel = require("../model/notesModel");
function getDate() { return new Date(); }
function Logger(data) { console.log("[" + getDate() + "] " + data); }

//get Notes
router.get('/getNotes', function (req, res, next) {
    console.log("[" + getDate() + "] INITIAL GET REQUEST");
    // get all notes and sort by DateCreated
    NotesModel.find().sort("DateCreated").find(function (err, Notes) {
        res.json(Notes);
    })
});

router.post('/addNote', function (req, res, next) {
    var newNoteData = new NotesModel(req.body);
    newNoteData.DateCreated = getDate();
    newNoteData.DateModified = getDate();
    newNoteData.save(function (err) {
        if (err) {
            console.log("Post", err);
            res.send("Cannot post data");
        }
        Logger("NEW NOTE RECEIVED :\n" + newNoteData);
        res.sendStatus(200);
    });
});

router.post('/addItem', function (req, res, next) {

    // set values for new item to add
    var newItem = {
        ItemID : req.body.ItemID,
        Title : req.body.Title,
        DateCreated : getDate(),
        DateModified : getDate(),
        Checked : req.body.Checked
    };

    Logger("NEW ITEM RECEIVED on NoteID " + req.body.NoteID);

    // find by NoteID and add item object to Items array
    NotesModel.findOneAndUpdate(
        {NoteID : req.body.NoteID},
        {$push : {Items: newItem}},
        {safe : true, upsert : true},
        function(err, model) {
            //console.log("Error = " + err);
        }
    );

    res.sendStatus(200);

});

router.post('/editNoteTitle', function (req, res, next) {
    Logger("EDIT NOTE TITLE RECEIVED on NoteID " + req.body.NoteID + " : new title : " + req.body.Title);
    // find by some conditions and update
    NotesModel.findOneAndUpdate(
        {NoteID: req.body.NoteID},
        {Title: req.body.Title, DateModified: getDate() },
        {safe: true, upsert: true},
        function(err, result) {
            if (!err) {
                //console.log(result);
            } else {
                console.log(err);
            }
        });
    //console.log("\nUPDATE : edit NOTE [" + getDate() + "] EDIT NOTE TITLE POST RECEIVED :\n", req.body);
    res.sendStatus(200);
});

router.post('/editItemTitle', function (req, res, next) {
    Logger("EDIT ITEM TITLE RECEIVED on ItemID " + req.body.ItemID + " : new title : " + req.body.Title);
    NotesModel.findOneAndUpdate(
        {   'NoteID': req.body.NoteID,
            'Items.ItemID': req.body.ItemID
        },
        {   $set : {
            'Items.$.Title' : req.body.Title,
            'Items.$.DateModified' : getDate()
            }
        },
        function(err,result){
            if (!err) {
                //console.log(result);
            } else {
                console.log(err);
            }
        });

    //console.log("\nUPDATE : edit ITEM [" + getDate() + "] EDIT ITEM TITLE POST RECEIVED :\n", req.body);
    res.sendStatus(200);
});

// apply new checked state (checked or unchecked) to item
router.post('/checkItem', function (req, res, next) {
    Logger("ITEM CHECKED STATUS CHANGE for ItemID : " + req.body.ItemID + " is now " + (req.body.Checked ? "CHECKED" : "UNCHECKED"));
    NotesModel.findOneAndUpdate(
        {   'NoteID': req.body.NoteID,
            'Items.ItemID': req.body.ItemID
        },
        {   $set : {
            'Items.$.Checked' : req.body.Checked,
            'Items.$.DateModified' : getDate()
            }
        },
        function(err,result){
            if (!err) {
                //console.log(result);
            } else {
                console.log(err);
            }
        });
    res.sendStatus(200);
});

// delete note by NoteID
router.post('/deleteNote', function (req, res) {
    Logger("DELETE NOTE by NoteID: " + req.body.NoteID);
    //console.log("[" + getDate() + "] DELETE NOTE: NoteID : " + req.body.NoteID);
    NotesModel.findOneAndRemove(
        {NoteID: req.body.NoteID},
        function(err,result){
        if (!err) {
            //console.log(result);
        } else {
            console.log(err);
        }
    });
    res.sendStatus(200);
});

// delete item by NoteID and ItemID
router.post('/deleteItem', function (req, res) {
    Logger("DELETE ITEM by NoteID : " + req.body.NoteID + " and ItemID : " + req.body.ItemID);
    NotesModel.findOneAndUpdate(
        {   'NoteID': req.body.NoteID
        },
        {   $pull : {
                "Items" : { 'ItemID' : req.body.ItemID }
            }
        },
        function(err,result){
            if (!err) {
                //console.log(result);
            } else {
                console.log(err);
            }
        });
    res.sendStatus(200);
});

module.exports = router;