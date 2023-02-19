const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password: {type:String, required:true},
    pic:{type:String, default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",}
},
{timestamps:true}) 


//defining document instance method for user model for comparing passwords

userSchema.methods.matchPassword = async function (enteredPassword) {
    // console.log(enteredPassword,this.password)
    return await bcrypt.compare(enteredPassword, this.password);
  };

//this will only work  for newly added user password. thats what userschema.pre does.
userSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    // encrypting password using bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });



const userModel = mongoose.model("user",userSchema)

module.exports = userModel