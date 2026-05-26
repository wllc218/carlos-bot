const mongoose = require("mongoose");

const messageCountSchema = mongoose.Schema({
    //user_id
    _id: {  
        type: String,
        required: true,
    },

    //how many messages
    messageCount: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("messageCount", messageCountSchema, "messageCount");