const db = require("../database/db");

exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vw_estoque ORDER BY nome");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, categoria, unidade_medida, quantidade, valor_unitario } = req.body;

    if (!nome || !categoria || !unidade_medida)
      return res.status(400).json({ erro: "Nome, categoria e unidade de medida são obrigatórios." });

    if (quantidade === undefined || Number(quantidade) < 0)
      return res.status(400).json({ erro: "Quantidade deve ser maior ou igual a zero." });

    if (valor_unitario === undefined || Number(valor_unitario) <= 0)
      return res.status(400).json({ erro: "Valor unitário deve ser maior que zero." });

    const [result] = await db.query(
      `INSERT INTO produtos (nome, categoria, unidade_medida, quantidade, valor_unitario)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, categoria, unidade_medida, quantidade, valor_unitario]
    );

    res.status(201).json({ mensagem: "Produto cadastrado.", id_produto: result.insertId });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.totalPorCategoria = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT categoria,
             SUM(quantidade) AS quantidade_total,
             ROUND(SUM(quantidade * valor_unitario), 2) AS valor_total
      FROM produtos
      GROUP BY categoria
      ORDER BY categoria
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.limites = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_produto, nome, quantidade,
             ROUND((quantidade / 100) * 100, 2) AS percentual_nivel,
             CASE
               WHEN quantidade <= 0 THEN 'MÍNIMO ATINGIDO'
               WHEN quantidade >= 100 THEN 'MÁXIMO ATINGIDO'
             END AS situacao
      FROM produtos
      WHERE quantidade <= 0 OR quantidade >= 100
      ORDER BY quantidade
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};