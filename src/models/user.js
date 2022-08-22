const mongoose = require('mongoose') // mongoose is an ODM lib
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true // remove additional spaces from name(beginning and ending)
   },
   email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(email){
         if(!validator.isEmail(email)){
            throw new Error('Email is invalid')
         }
      }
   },
   password: {
      type: String,
      required: true,
      trim: true,
      // minlength: 7, // can use this line instead of validating in the validate func
      validate(password){
         if(password.length <= 6){
            throw new Error('Password is invalid: must be longer than 6')
         }
         if(password.toLowerCase().includes('password')){
            throw new Error('Password is invalid: can not have passowrd in it')
         }
      }
   },
   age: {
      type: Number,
      default: 0,
      validate(value){
         if( value < 0){
            throw new Error('Age must be a positive number')
         }
      }
   },
   tokens: [{
      token: {
         type: String,
         required: true
      }
   }],
   avatar: {
      type: Buffer // to save images to db
   }
}, {
   timestamps: true // create the user with two new fields => 1) createdAt 2) updatedAt
})

userSchema.virtual('tasks',{ // virtual attribute to specify the relation between the two models ... this helps fetching the tasks of a certain user
   ref: 'Task',
   localField: '_id',
   foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email,password) => { // statics accessed on the model itself (User)
   const user = await User.findOne({ email })
   if(!user){
      throw new Error('Unable to login')
   }
   const isMatch = await bcrypt.compare(password,user.password)
   if(!isMatch){
      throw new Error('Unable to login')
   }
   return user
}

userSchema.methods.generateAuthToken = async function() { // methods accessed on the instances
   const user = this
   const token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET)
   user.tokens = user.tokens.concat({token})
   await user.save()
   return token
}

userSchema.methods.toJSON = function(){ // toJSON gets called whenever we call JSON.stringify and express when sending an object in send func it automatically calls JSON.stringify
   const user = this
   const userObj = user.toObject()
   delete userObj.password
   delete userObj.tokens
   delete userObj.avatar
   return userObj
}

// Hash the plaintext password before saving
userSchema.pre('save',async function(next){ // pre => do the opertaion before the the given operation( for example here saving the document )
   const user = this
   if(user.isModified('password')){ // true if user has been created or user has been updated (passowrd updated)
      user.password = await bcrypt.hash(user.password,8)
   } 
   next() // important to tell the programm that we're done
})

userSchema.pre('remove', async function(next){ // before remove is called on the user is called this func is called
   const user = this
   await Task.deleteMany({owner: user._id})
   next()
})

const User = mongoose.model('User',userSchema)

module.exports = User