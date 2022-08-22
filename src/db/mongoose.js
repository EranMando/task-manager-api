const mongoose = require('mongoose') // mongoose is an ODM lib
const validator = require('validator')

mongoose.connect(process.env.MONGODB_URL, {
   useNewUrlParser: true,
   // useFindAndModify: false
   // useCreateIndexs: true
})



