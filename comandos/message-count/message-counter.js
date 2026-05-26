const mongo = require("./mongo");
module.exports = (client) => {
    client.on("messageCreate", message => {
        const { author } = message;

        console.log("AUTHOR: " + author);
        mongo();
    })
}