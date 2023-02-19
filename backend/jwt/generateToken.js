const jwt = require('jsonwebtoken')

const generateToken = (id)=>{
    return jwt.sign({id},'abcdefghijklmnopq',{
        expiresIn:"30d"
    })
}

module.exports= generateToken