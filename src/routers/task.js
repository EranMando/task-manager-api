const express = require('express');
require('./../db/mongoose.js');
const Task = require('./../models/task.js');
const auth = require('./../middleware/auth.js')

const router = new express.Router()

router.post('/tasks',auth, async (req,res) => { // route for creating a task
   // const task = new Task(req.body)
   const task = new Task({
      ...req.body, // takes the attributes from body and adds them to the Task
      owner: req.user._id
   })
   try{
      await task.save()
      res.status(201).send(task)
   }catch(error){
      res.status(400).send(error)
   }
})

// /tasks?completed=true => return all the completed tasks => we get the completed value from req.query.completed
// pagination => /tasks?limit=10&skip=0
// /tasks?sortBy=createdAt:${type(descending/ascending)}
router.get('/tasks', auth , async (req,res) => { // route for fetching all the tasks
   const match = {}
   if(req.query.completed){
      match.completed = req.query.completed === 'true'
   }

   const sort = {}
   if(req.query.sortBy){
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
   }

   try{
      await req.user.populate({
         path: 'tasks', // field in users(virtual/regular)
         match: match, // what are we matching it with // for example here returns all the tasks that are completed
         options: { // helps with pagination
            limit: parseInt(req.query.limit), // how many document to fetch/populate with
            skip: parseInt(req.query.skip), // how many documents to skip before fetching/populating
            sort: sort // fetching the tasks sorted by a filed => example fetching the tasks by their creation day so we can disaply the first ten and soo on
            //{

               //createdAt: -1 // sort by createdAt field in a desc fashion // 1 for asc
            //}
         }
      })
      console.log(req.user.tasks)
      res.send(req.user.tasks)   
   }catch(error){
      res.status(500).send()
   }
})

router.get('/tasks/:id',auth, async (req,res) => { // route for fetching a task by his id
   try{
      //const task = await Task.findById(req.params.id)
      const task = await Task.findOne({_id: req.params.id,owner: req.user._id})
      if(!task){
         res.status(404).send()
         return
      }
      res.send(task)
   }catch(error){
      res.status(500).send()
   }
})

router.patch('/tasks/:id',auth, async(req,res) => { // route for updating a task
   const updates = Object.keys(req.body)
   const allowedUpdates = ['description','completed']
   const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
   })
   if(!isValidOperation)
      return res.status(400).send({error: 'Invalid updates!'})
      
   try{
      const task = await Task.findOne({_id:req.params.id,owner: req.user._id})
      if(!task){
         return res.status(404).send()
      }
      updates.forEach(update => task[update] = req.body[update])
      await task.save()
      res.send(task)
   }catch(error){
      res.status(500).send()
   }
})


router.delete('/tasks/:id',auth , async(req,res) => { // route for deleting a task
   try{
      const task = await Task.findOneAndDelete({_id: req.params.id , owner: req.user._id})
      if(!task){
         return res.status(404).send()
      }
      res.send(task)
   }catch(e){
      res.status(500).send()
   }
})

module.exports = router

