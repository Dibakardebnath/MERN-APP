const mongoose = require('mongoose')

const userschema=new mongoose.Schema({
    
    email:"String",
    title:"String",
    category:"String",
    description:"String",
    user_id:"String"
},{
    timestamps:true,
    
})
const UserModel=mongoose.model('user',userschema)

module.exports ={UserModel}