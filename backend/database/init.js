const mongoose = require('mongoose')

module.exports = ()=>{
    mongoose.connect("mongodb+srv://user:user@cluster0.nkphu8y.mongodb.net/?retryWrites=true&w=majority")
    .then(()=>{
        console.log("connected to db")
    })
    .catch(()=>{
        console.log("error")
    })
}