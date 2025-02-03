const mongoose = require("mongoose")
const main = require("../main.js")


const LoginSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    } ,
    password: {
        type: String,
        required: true
    }
})



const collection = new mongoose.model("users", LoginSchema)
module.exports = collection
