// const chalk = require('chalk') // for testing yarn
// YARN = NPM - difference: Yarn can install packages parallely ( + more secure(I guess according to an article))
                        //  while NPM installs one package at a time
// Commands for un/installing packages in both Package Managers
   // yarn add ${package_name} / yarn remove ${package_name}
   // npm i ${package_name} / npm uninstall ${package_name}

const express = require('express');
require('./db/mongoose.js');
const User = require('./models/user.js');
const Task = require('./models/task.js');
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const app = express()
const port = process.env.PORT // for heroku later

// app.use((req,res,next) => { // runs between recieving a request and running the route handler
//    if(req.method === 'GET'){
//       res.send('GET requests are disabled')
//    }
//    else{
//       next() // telling the program that we are done with this middleware func and it should continue running 
//    }
// })


// maintenance middleware func
   // app.use((req,res,next) => {
   //    res.status(503).send('Site is currently down. Check back soon')
   // }}

app.use(express.json()) // automatically parse incoming json to an object
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
   console.log('Server is up on port ' + port)
})







// jwt.sign({_id: ${id}} , ${secret})
// jwt.verify('${token}',${our_secret_above}) // returns an object if the token is valid otherwise throws an error


// bcrypt.hash(${password},${num_of_rounds},{expiresIn: ${time - for example '7 days}})
// bcrypt.compare(${provided_pass},${password})



// Relations between models
   // const main = async () => {

      // getting the user of the task ( regular property)
         // const task = await Task.findById('')
         // await task.populate('owner').execPopulate() // using ref attribute -> look at task model in the owner attribute
         // console.log(task.owner)

      // getting the tasks of the user (virtual property)
         // const user = await User.findById('')
         // await user.populate('tasks').execPopulate()
         // console.log(user.tasks)
   // }

   // main()

// env-cmd