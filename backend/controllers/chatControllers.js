const asyncHandler = require('express-async-handler')
const Chat = require('../database/models/chatModel')
const User = require('../database/models/userModel')


const accessChat = asyncHandler(async (req,res)=>{
//creating one on one chat if it doesnt exist with the current user id.
//else fetch chats with that user id.

const {user} = req.body
console.log(user)

if (!user._id) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    $and:[
        {users:{$elemMatch:{$eq:req.user._id}}}, //for checking if both users exists in a chat.
        {users:{$elemMatch:{$eq:user._id}}},
        {isGroupChat:false}
    ]
  }).populate("users","-password").populate("latestMessage")
//now,latest message contains ref of message model thus to populate that.

  isChat = await User.populate(isChat,{
    path: 'latestMessage.sender',
    select: "name pic email"
  })

  if(isChat.length>0){
    res.send(isChat[0])
  }else{
    //else creating a new chat with the two users
    let chatData = {
        chatName:user.name,
        isGroupChat:false,
        users:[req.user._id,user._id]
    }

    try {
        const createdChat = await Chat.create(chatData)
        const fullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password")

        res.status(200).send(fullChat)
        
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
  }
})

const fetchChats = asyncHandler(async(req,res)=>{
    //going through array of users in chat model and finding each chat where current user is part of.

    try {
       let allChats = await Chat.find({users:{$elemMatch: {$eq : req.user._id}}})
       .populate("users","-password")
       .populate("latestMessage")
         .sort({updatedAt:-1})
    
        // allChats = await User.populate(allChats,{
        //     path : "latestMessage.sender",
        //     select: "name email pic"
    
    //    })
       res.status(200).send(allChats)
        
       
    } catch (error) { 
        res.status(400)
        throw new Error(error.message)
    }

})

//groupchats--

//Create Group
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user); //logged in user and selected users.

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


//rename group
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

//remove user
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // Admin check done at client side.

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId }, //$pull is used to remove all values from array that matches condition .
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

//add user
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});


module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};