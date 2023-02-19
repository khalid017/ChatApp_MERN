const express = require('express')
var cors = require('cors')
const cookie = require('cookie-parser')

const app = express()

app.use(cors(

    {
        origin:"http://127.0.0.1:3000"  //origin of where req is comming from. 
    }
))
const port = 5000
app.use(express.json()) //middleware for parsing json data
app.use(cookie())
const server = app.listen(port,()=>{
    db()
    console.log(`server running at ${port}`)
})

const db = require('./database/init')
// const userController = require('./controllers/userControllers')

const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

//settingup socket.
const io = require('socket.io')(server)
    // pingTimeout : 60000, //if no chat exchanged for 60 secs. connection automatically terminates to save bandwidth.
    // cors:{ // to prevent cross origin errors.
    //     origin:'http://localhost:5000/' 
    // }


io.on('connection',(socket)=>{
    console.log("user connected")
   
    //getting user data and setting up room.
    socket.on('setup',(userData)=>{
        //room for that user
        socket.join(userData._id)
        // console.log("room"+userData._id)
        socket.emit("connected")
    })

    //for joining chat.
    //creating room with id 
    socket.on('join chat',(roomId)=>{//roomid = selected chat id
        socket.join(roomId)
        console.log("user joined rooom "+roomId)
    })

    //sending msg scoket
    socket.on('send message',(message)=>{ //message={content,chat id} from client

        let chat = message.chat //for getting id of chat to determine whih room to send this to
        // console.log(chat)

        // socket.broadcast.in(chat._id).emit("message received",message) //for room

        chat.users.forEach((user)=>{
            if(user._id == message.sender._id ) return//for not sending the msg back to sender.

            socket.in(user._id).emit("message received",message)//  sending the msg to the room with userid= user._id
        })  
    })

    // socket.on("upload",(data)=>{
    //     const chat = data.chat
    //     const id= data._id
    //     //console.log(data)
    //     chat.users.forEach((user)=>{
    //         if(user._id == id ) return//for not sending the msg back to sender.

    //         socket.in(user._id).emit("file received",data.file)//  sending the msg to the room with userid= user._id
    //     })  
    // })
})


/////////////////////////////////////////////////
app.use('/api/user',userRoutes)// user related routes in userRoutes file. Here base endpoint is written, other usr related end point can be like, api/user/login.

app.use('/api/chat',chatRoutes) //chat route

app.use('/api/message',messageRoutes)