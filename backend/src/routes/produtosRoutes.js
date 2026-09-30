const router = require("express").Router();
const c = require("../controllers/produtosController");

router.get("/", c.listar);
router.post("/", c.criar);
router.get("/categorias", c.totalPorCategoria);
router.get("/limites", c.limites);

module.exports = router;