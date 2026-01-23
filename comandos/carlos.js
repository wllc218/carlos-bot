module.exports = {
    name: "carlos",
    execute(message) {
        const palavra = "carlos";

        const anagrama = palavra
            .split("")              // ["c","a","r","l","o","s"]
            .sort(() => Math.random() - 0.5) // embaralha
            .join("");              // junta de novo

        message.reply({
            content: anagrama,
        });
    }
};
