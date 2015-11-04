var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotesSchema = new Schema({
    NoteID: Number,
    Title: String,
    Color: String,
    Items: [ { ItemID: Number, Title : String, DateCreated : Date, DateModified: Date, Checked: Boolean } ],
    DateCreated: Date,
    DateModified: Date
});

var NotesModel = mongoose.model('NotesModel', NotesSchema);

module.exports = NotesModel;