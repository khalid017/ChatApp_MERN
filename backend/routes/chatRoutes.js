const express = require('express')
const authorize = require('../middleware/authMiddleware')
const {accessChat,fetchChats,createGroupChat,removeFromGroup,renameGroup,addToGroup} = require('../controllers/chatControllers')
const router = express.Router()

router.route('/').post(authorize, accessChat) //create Chat if doesnt exist,else access.
.get(authorize,fetchChats) //fetching all chats for a loggedin user.

router.route("/group").post(authorize, createGroupChat);
router.route("/rename").put(authorize, renameGroup);
router.route("/groupremove").put(authorize, removeFromGroup);
router.route("/groupadd").put(authorize, addToGroup);



module.exports = router