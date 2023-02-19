const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId,
    ref:"user"},
    content:{type:String ,trim:true},
    file:{type:String ,trim:true},
    chat:{type:mongoose.Schema.Types.ObjectId,
    ref:"chat",index:true}
},{timestamps:true})

const messageModel = mongoose.model("message",messageSchema)

module.exports = messageModel