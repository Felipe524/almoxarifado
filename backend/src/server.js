const express = require("express");
const cors = require("cors");
require("dotenv").config();

const produtosRoutes = require("./routes/produtosRoutes");
const movimentacoesRoutes = require("./routes/movimentacoesRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API do Almoxarifado funcionando!" });
});

app.use("/produtos", produtosRoutes);
app.use("/movimentacoes", movimentacoesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});