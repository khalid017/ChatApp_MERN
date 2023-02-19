const jwt = require('jsonwebtoken')
const User = require('../database/models/userModel')
const asyncHandler = require('express-async-handler')

const authorize = asyncHandler(async(req,res,next)=>{
    let token

    if(req.cookies){
        try{
            token = req.cookies.token
            const decodedToken = jwt.verify(token,'abcdefghijklmnopq')
            req.user = await User.findById(decodedToken.id).select("-password")//this is for removing password field from the query
            next()
        }catch(error){
            res.status(401)//unauthorized response status code.
            throw new Error("Not authorized")
        }
    }

})

module.exports = authorize