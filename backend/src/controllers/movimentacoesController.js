const db = require("../database/db");

exports.saidas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id_saida, p.nome, p.unidade_medida, s.quantidade,
             s.valor_unitario, s.data_final,
             ROUND(s.quantidade * s.valor_unitario, 2) AS valor_total
      FROM saidas s
      JOIN produtos p ON p.id_produto = s.id_produto
      ORDER BY s.data_final DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.entrada = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id_produto, quantidade, data_inicial, valor_unitario } = req.body;

    if (!id_produto || Number(quantidade) <= 0)
      return res.status(400).json({ erro: "Produto e quantidade válida são obrigatórios." });

    await conn.beginTransaction();

    const [prod] = await conn.query(
      "SELECT id_produto FROM produtos WHERE id_produto = ? FOR UPDATE",
      [id_produto]
    );
    if (!prod.length) throw new Error("Produto não encontrado.");

    const [p] = await conn.query(
      "SELECT valor_unitario FROM produtos WHERE id_produto = ?",
      [id_produto]
    );

    const valor = valor_unitario ?? p[0].valor_unitario;

    await conn.query(
      `INSERT INTO entradas (id_produto, quantidade, data_inicial, valor_unitario)
       VALUES (?, ?, ?, ?)`,
      [id_produto, quantidade, data_inicial || new Date(), valor]
    );

    await conn.query(
      "UPDATE produtos SET quantidade = quantidade + ? WHERE id_produto = ?",
      [quantidade, id_produto]
    );

    await conn.commit();
    res.status(201).json({ mensagem: "Entrada registrada e estoque atualizado." });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ erro: e.message });
  } finally {
    conn.release();
  }
};

exports.movimentacoesPeriodo = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;
    if (!dataInicial || !dataFinal)
      return res.status(400).json({ erro: "Informe dataInicial e dataFinal." });

    const [rows] = await db.query(`
      SELECT p.nome, p.unidade_medida,
             COALESCE(SUM(CASE WHEN e.id_entrada IS NOT NULL THEN e.quantidade ELSE 0 END),0) AS total_entradas,
             COALESCE(SUM(CASE WHEN s.id_saida IS NOT NULL THEN s.quantidade ELSE 0 END),0) AS total_saidas,
             COALESCE(SUM(CASE WHEN e.id_entrada IS NOT NULL THEN e.quantidade ELSE 0 END),0)
             - COALESCE(SUM(CASE WHEN s.id_saida IS NOT NULL THEN s.quantidade ELSE 0 END),0) AS saldo_periodo,
             ROUND(COALESCE(SUM(CASE WHEN e.id_entrada IS NOT NULL THEN e.quantidade * e.valor_unitario ELSE 0 END),0),2) AS valor_total_entradas,
             ROUND(COALESCE(SUM(CASE WHEN s.id_saida IS NOT NULL THEN s.quantidade * s.valor_unitario ELSE 0 END),0),2) AS valor_total_saidas
      FROM produtos p
      LEFT JOIN entradas e ON e.id_produto = p.id_produto
        AND DATE(e.data_inicial) BETWEEN ? AND ?
      LEFT JOIN saidas s ON s.id_produto = p.id_produto
        AND DATE(s.data_final) BETWEEN ? AND ?
      GROUP BY p.id_produto, p.nome, p.unidade_medida
      ORDER BY p.nome
    `, [dataInicial, dataFinal, dataInicial, dataFinal]);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};

exports.maiorSaida = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;
    if (!dataInicial || !dataFinal)
      return res.status(400).json({ erro: "Informe dataInicial e dataFinal." });

    const [rows] = await db.query(`
      SELECT p.nome,
             SUM(s.quantidade) AS quantidade_total_saida,
             ROUND(SUM(s.quantidade * s.valor_unitario), 2) AS valor_total_financeiro_saidas
      FROM saidas s
      JOIN produtos p ON p.id_produto = s.id_produto
      WHERE DATE(s.data_final) BETWEEN ? AND ?
      GROUP BY p.id_produto, p.nome
      ORDER BY quantidade_total_saida DESC
    `, [dataInicial, dataFinal]);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};