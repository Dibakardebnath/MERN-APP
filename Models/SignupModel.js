const mongoose = require('mongoose')

const signschema=new mongoose.Schema({
    name:"String",
    email:"String",
    password:"String"
},{
    timestamps:true,
})
const SignUpModels=mongoose.model('signup',signschema)

module.exports = {SignUpModels}