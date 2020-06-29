const mongoose = require('mongoose');
const validator = require('validator');

const taskSchemea = new mongoose.Schema({
    'desc': {
        type: String,
        required: true,
        trim: true
    },
    'completed': {
        type: Boolean,
        default: false
    },
    'owner': {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchemea)

module.exports = Task