const express = require('express');
require('./../db/mongoose.js');
const User = require('./../models/user.js');
const auth = require('../middleware/auth.js')
const multer = require('multer') // gives us the ability to accept files to the server
const sharp = require('sharp') // helps resizing images and converting file types (for instance png -> jpeg)
const {sendWelcomeEmail,sendCancelationEmail} = require('../emails/account.js')


const upload = multer({
   //dest: 'avatars', // name of the folder where the files will be stored // if dest is not provided multer does not save the file on our machine instead it passes the file to the route handler
   limits: 1000000,  // limiting the object - for example the file size
   fileFilter(req,file,cb) { // filtering the file = for example file type (jpg/pdf...)
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
         cb(new Error('File type is not supported - please upload an image'))
         return
      }  
      cb(undefined,true)
   }
})

const router = new express.Router() // gives us the ability to seperate routes to files

router.post('/users' , async (req,res) => { // route for creating a new user
   const user = new User(req.body)
   try{
      await user.save()
      const token = await user.generateAuthToken()
      sendWelcomeEmail(user.email,user.name) // this is asynchrous , though we dont need await becuase we dont need to wait until mailgun finishes sending the email , we can continue with dealing with the request
      res.status(201).send({user,token})
   }catch(error){
      res.status(400).send(error)
   }
})

router.post('/users/logout', auth, async (req,res) => {
   try{
      req.user.tokens = req.user.tokens.filter((token) => {
         return token.token != req.token
      })
      await req.user.save()
      res.send()
   }catch(error){
      res.status(500).send()
   }
})

router.post('/users/logoutAll', auth , async(req,res) => {
   try{
      req.user.tokens = []
      await req.user.save()
      res.send()
   }catch(e){
      res.status(500).send()
   }
})

router.get('/users/me', auth ,async (req,res) => { // route for fetching all the users // second argument is for the middleware
   res.send(req.user)
})

router.patch('/users/me',auth, async(req,res) => { // route for updating a user
   const updates = Object.keys(req.body)
   const allowedUpdates = ['name','email','password','age']
   const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
   })
   if(!isValidOperation)
      return res.status(400).send({error: 'Invalid updates!'})

   try{
      const user = req.user
      updates.forEach((update) => {
         user[update] = req.body[update] // we use brackets in an object if the attribute is dynamic (we are not using it's literal name)
      })
      await user.save()
      // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true})
      res.send(user)
   }catch(error){
      res.status(500).send()
   }
})

router.delete('/users/me', auth, async(req,res) => { // route for deleting a user
   try{
      await req.user.remove() // remove is the oppostie of save() in mongoose
      sendCancelationEmail(req.user.email,req.user.name)
      res.send(req.user)
   }catch(e){
      res.status(500).send()
   }
})

router.post('/users/login', async (req,res) => { // route for authentication (logging in)
   try{
      const user = await User.findByCredentials(req.body.email,req.body.password)
      const token = await user.generateAuthToken()
      res.send({user,token})
   }catch(e){
      res.status(404).send()
   }
})

router.post('/users/me/avatar',auth, upload.single('avatar')  , async (req,res) => { // two middleware funcs auth and upload.single => first runs the auth then the upload.single
   const buffer = await sharp(req.file.buffer).resize({width: 250 , height: 250}).png().toBuffer() // resize image and convert it to png and then convert the data back to Buffer
   req.user.avatar = buffer
   await req.user.save() 
   res.send()
}, (error,req,res,next) => {
   res.status(400).send({error: error.message})
} ) // function designed to handle errors that gets thrown from the middleware

router.delete('/users/me/avatar' , auth , async(req,res) => { // route for wipping the avatar
   req.user.avatar = undefined
   await req.user.save()
   res.send()
})

router.get('/users/:id/avatar',async (req,res) => {
   try{
      const user = await User.findById(req.params.id)
      if(!user || !user.avatar){
         throw new Error()
      }
      res.set('Content-Type','image/png')
      res.send(user.avatar)
   }catch(error){
      res.status(400).send()
   }
})

module.exports = router