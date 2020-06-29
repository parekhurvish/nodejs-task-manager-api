const express = require("express")
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')

router.post('/users/login', async (req, resp) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        user.tokens = user.tokens.concat({ token });
        await user.save()

        resp.send({ user, token })
    } catch (e) {
        console.log(e)
        resp.status(400).send(e)
    }
})

router.get('/users/logout', auth, async (req, resp) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        console.log(req.user)
        await req.user.save()
        resp.status(200).send("Logged Out!!!")
    } catch (e) {
        resp.status(500).send(e)
    }
})

router.get('/users/logoutAll', auth, async (req, resp) => {
    try {
        req.user.tokens = []
        await req.user.save()
        resp.status(200).send("Logged Out All users!!!")
    } catch (e) {
        resp.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, resp) => {
    resp.send(req.user)
})

router.post('/users', async (req, resp) => {

    const user = new User(req.body);
    const token = await user.generateAuthToken()

    user.tokens = user.tokens.concat({ token })
    try {
        await user.save();
        resp.status(201).send({ user, token });
        console.log('User Creaetd', user);
    } catch (e) {
        resp.status(400).send(e)
    }
})

router.patch('/users/me', auth, async (req, resp) => {
    const updates = Object.keys(req.body)

    try {

        // const user = await User.findById(_id)

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
        // if (!user) {
        //     resp.status(404).send("No User found!!!")
        // }
        resp.status(200).send(req.user)
    } catch (e) {
        resp.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, resp) => {
    const _id = req.user._id

    try {
        // const user = await User.findByIdAndDelete(_id);

        // if (!user) {
        //     resp.status(404).send("No User found!!!")
        // }
        await req.user.remove()
        resp.status(200).send(req.user)
    } catch (e) {
        resp.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("Please updaload Image file"))
        }
        cb(undefined, true)
        // cb(new Error("File must be image"))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

router.post("/me/avatar", auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(404).send({error: error.message});
})

router.delete("/user/me/avatar", auth, async(req, res)=> {
    try{
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get("/users/:id/avatar", async (req, res)=>{
    try{
        console.log("hello")
        const user = await User.findById(req.params.id)
        if(!user){
            throw new Error()
        }

        res.set('Content-type', 'Image/jpeg')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router

