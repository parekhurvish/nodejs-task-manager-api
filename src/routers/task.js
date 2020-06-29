const express = require("express")
const Task = require("../models/task")
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/tasks', auth, async (req, resp) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        resp.status(201).send(task);
        console.log('Task Creaetd', task);
    } catch (e) {
        resp.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, resp) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "desc" ? 1 :-1  
    }

    try {
        // const tasks = await Task.find()
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        resp.status(200).send(req.user.tasks)
    } catch (e) {
        resp.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, resp) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id,'_id')
        console.log(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })

        console.log("Task", task)
        if (!task) {
            resp.status(404).send();
        }
        resp.status(200).send(task)
    } catch (e) {
        resp.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, resp) => {
    const _id = req.params.id

    const updates = Object.keys(req.body)
    const allowUpdate = ['desc', 'completed'];

    const isValidUpdate = updates.every((update) => allowUpdate.includes(update))
    if (!isValidUpdate) {
        return resp.status(400).send("Not Valida Update")
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
        if (!task) {
            resp.status(404).send("No Task found!!!")
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        resp.status(200).send(task)
    } catch (e) {
        resp.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, resp) => {
    const _id = req.params.id

    try {
        // const task = await Task.findByIdAndDelete(_id);
        const task = await Task.findByIdAndDelete({ _id, owner: req.user._id })

        if (!task) {
            resp.status(404).send("No task found!!!")
        }

        resp.status(200).send(task)
    } catch (e) {
        resp.status(500).send(e)
    }
})

module.exports = router