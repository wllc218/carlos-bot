const fs = require("fs");

const dados = JSON.parse(
    fs.readFileSync("database.json", "utf8")
);

dados.testando = "funcionou";

fs.writeFileSync(
    "database.json",
    JSON.stringify(dados, null, 2)
);
