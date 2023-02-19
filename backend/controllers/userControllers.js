//controller for signup


const asyncHandler = require('express-async-handler')
//###### express Async handler ######
// handles exceptions iside async express routes//

const User = require('../database/models/userModel')

//user sends jwt to backend and server verifies the use3r.
const createToken = require('../jwt/generateToken')

const regUser = asyncHandler(async (req,res)=>{
    // console.log(req.body)
  const{name,email,password} = req.body

//   if(name|| email || password )
//   {
//     res.status(400) //bad req resp, client error
//     throw new Error("Enter all fields")
//   }

  //checking if user already exists
  const userExists = await User.findOne({email})
  if(userExists)
  {
    res.status(400)
    throw new Error("User already exists")
  }

  //creating new user
  const user = await User.create({
    name,
    email,
    password,
  })

  if(user) //if successfuly created
  {
    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        //generating jwt token and sending to user when registered
        // token:createToken(user._id)
    })
  }else{
    res.status(400)
    throw new Error("Failed to create user")
  }

}) 

 //login function
const authUser = asyncHandler(async (req,res)=>{
    const{email,password} = req.body
    const user = await User.findOne({email})

    if(user && await user.matchPassword(password)){ //user found in db and password matches too
        //matchpass method returns promise.
        res.cookie("token",createToken(user._id))
        res.json({
            _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        //generating jwt token and sending to user when registered
        // token:createToken(user._id)
        })
    }else{
        res.status(401)
        throw new Error("Invalid email or password")
      }
})

//##get all users except current user

//below query means if theres a query in req, then we use $or which means if either of the expressions in array are statisfied it will work
// regex is used for pattern matching strigs in queries with options like "i" means to use case insensitivity.
//it matches string in name prop in db with req.query.search, and same for email if either found returns document that satisfies.
const allUsers = asyncHandler(async (req,res)=>{
    const key = req.query.search ? 
         [
            {name:{$regex :req.query.search, $options: "i"}},

        ]
    :{}
  //  console.log(key[0])

    //now key contains req data, we'll query those data form db now.
    const users = await User.find(key[0]).find({_id:{$ne:req.user._id }})// all users except currernt user. $ne means not eqaul to query
    //## for using req.user.id we need to login user i.e provide jwt token.

    res.send(users)
})

module.exports ={regUser,authUser,allUsers}