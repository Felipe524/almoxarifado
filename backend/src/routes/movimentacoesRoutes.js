const router = require("express").Router();
const c = require("../controllers/movimentacoesController");

router.get("/saidas", c.saidas);
router.post("/entradas", c.entrada);
router.get("/periodo", c.movimentacoesPeriodo);
router.get("/maior-saida", c.maiorSaida);

module.exports = router;