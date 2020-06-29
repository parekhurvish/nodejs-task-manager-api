const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require("./task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 32,
        validate(value) {
            if (value < 0) {
                throw new Error("Age cannot be < 0")
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        //required: true,
        trim: true,
        //minlength: [6, 'Too short, Password!!!'],
        validate(value) {
            if (value.includes('password')) {
                throw new Error("Password canont contain 'password'!!!")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("NO User with email")
    }
    try {
        const IsMatch = await bcrypt.compare(password, user.password)

        if (!IsMatch) {
            throw new Error("Unable to login")
        }
        return user
    } catch (e) {
        console.log(e)
    }
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    let user = this;
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
    return token
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    console.log("Before Saving")

    next()
})

userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({ owener: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;