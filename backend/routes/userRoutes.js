
const express = require('express')

const router = express.Router()
const {regUser,authUser,allUsers} = require('../controllers/userControllers')
const authorize = require('../middleware/authMiddleware')


// express.router instance is a complete middleware and is used for handling multiple routes of same base path/ end point. 

router.route('/').post(regUser) // for signup usr
.get(authorize,allUsers)//authorize is middleware for authorizing user using jwt.
router.post('/login',authUser) // for usr authentication.


module.exports = router
 