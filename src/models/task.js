const mongoose = require('mongoose') // mongoose is an ODM lib
const validator = require('validator')

const taskSchema = new mongoose.Schema({
   description:{
      type: String,
      required: true,
      trim: true
   },
   completed: {
      type: Boolean,
      default: false
   },
   owner:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // reference of a user in the 'User' collection/model
   }
},{
   timestamps: true
})


const Task = mongoose.model('Task',taskSchema)

module.exports = Task