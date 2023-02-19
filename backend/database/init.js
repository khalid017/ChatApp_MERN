const mongoose = require('mongoose')

module.exports = ()=>{
    mongoose.connect("your api key")
    .then(()=>{
        console.log("connected to db")
    })
    .catch(()=>{
        console.log("error")
    })
}
