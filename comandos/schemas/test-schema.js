const mangoose = require("mongoose");

const schema = new mangoose.Schema({
    message: {
        type: String,
        required: true,
    }
})

module.exports = mangoose.model("testing", schema, "testing");