const asyncHandler = require('express-async-handler')
const User = require('../database/models/userModel')
const Chat = require('../database/models/chatModel')
const Message = require('../database/models/messageModel')
const fs = require('fs')
const sendMessage = asyncHandler(async(req,res)=>{
    //here we need message body, who to send and sender name.

    const file = req.body.file
    const chatId = req.body.chatId
    const content = req.body.content
  //console.log(req.body)
    // if (!content || !chatId) {
    //     console.log("Invalid data passed into request");
    //     return res.sendStatus(400);
    //   }

      

       let newMessage = file?
       {
        sender: req.user._id,// id from logged in user
        content:content,
        file:file,
        chat:chatId
       }
       :
       {
        sender: req.user._id,// id from logged in user
        content:content,
        chat:chatId
       }

       try {
        //creating message in db

      let message = await Message.create(newMessage)

      //now populating fields
      message = await message.populate("sender","name pic")

      message = await message.populate("chat")

      message = await User.populate(message,{
        path:"chat.users",
        select:"name email pic"
      })

      // Updating latest message
        await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:message})

        res.json(message)
        
       } catch (error) {
        res.status(400)
        throw new Error(error.message)
       }
}) 

const allMessages = asyncHandler(async(req,res)=>{
    try {
        //fetching all messages with chatId
       // console.log(req.query.id)
        const id =req.query.id
        const skip = req.query.skip
        const count = await Message.count({chat:id})
        const messages = await Message.find({chat:id}).limit(14).skip(skip).sort({createdAt:-1})

        // const count = await Message.count({chat:req.params.chatId})

        // const messages = await Message.find({chat:req.params.chatId})
        .populate("sender","name email pic")
        .populate("chat")
        const data =
        {
          messages:messages,
          count:count
        }

        res.json(data)
         
        
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
        
    }

})

const uploadFile = asyncHandler(async(req,res)=>{

  const url = req.file.filename
  //console.log(url.substring(url.length-3,url.length))
  res.json(url)
})

const sendFile = (req,res)=>{
  res.sendFile(req.params.path,{root:"./Uploads"})

}
module.exports = {sendMessage,allMessages,uploadFile,sendFile}