const mongoose = require('mongoose')

const connection=mongoose.connect("mongodb+srv://ddibakar190:KQG1emnlC9eLL0vL@cluster0.x5sxwu5.mongodb.net/MERN-APP")

module.exports ={connection}