const express = require("express")
require('./db/mongoose.js');

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(userRouter).use(taskRouter)

module.exports = app