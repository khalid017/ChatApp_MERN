const express = require('express')
const multer  = require('multer')
const fs = require('fs')

const authorize = require('../middleware/authMiddleware')
const {sendMessage,allMessages,uploadFile,sendFile} = require('../controllers/messageControllers')
const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'Uploads/')
    },
    filename: function (req, file, cb) {

      cb(null, Date.now()+file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
  

router.route('/').post(authorize,sendMessage) // for sending messages

// router.route('/:chatId').get(authorize,allMessages)//for getting all messages for a chat.
router.route('/').get(authorize,allMessages)//for getting all messages for a chat.

router.route('/upload/:path').post(authorize,upload.single("file"),uploadFile).get(authorize,sendFile)

module.exports = router