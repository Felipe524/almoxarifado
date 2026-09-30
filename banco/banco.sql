CREATE DATABASE IF NOT EXISTS almoxarifado;
USE almoxarifado;

DROP VIEW IF EXISTS vw_estoque;
DROP TABLE IF EXISTS saidas;
DROP TABLE IF EXISTS entradas;
DROP TABLE IF EXISTS produtos;

CREATE TABLE produtos (
  id_produto INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  unidade_medida VARCHAR(20) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_quantidade CHECK (quantidade >= 0),
  CONSTRAINT chk_valor CHECK (valor_unitario > 0)
);

CREATE TABLE entradas (
  id_entrada INT AUTO_INCREMENT PRIMARY KEY,
  id_produto INT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,  
  data_inicial DATE NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
  CONSTRAINT chk_entrada_qtd CHECK (quantidade > 0)
);

CREATE TABLE saidas (
  id_saida INT AUTO_INCREMENT PRIMARY KEY,
  id_produto INT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  data_final DATE NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
  CONSTRAINT chk_saida_qtd CHECK (quantidade > 0)
);

INSERT INTO produtos (nome, categoria, unidade_medida, quantidade, valor_unitario) VALUES
('Detergente', 'Limpeza', 'UN', 50, 3.50),
('Papel Toalha', 'Higiene', 'FD', 30, 8.00),
('Desinfetante', 'Limpeza', 'UN', 100, 6.50);

INSERT INTO entradas (id_produto, quantidade, data_inicial, valor_unitario) VALUES
(1, 50, '2026-09-01', 3.50),
(2, 30, '2026-09-02', 8.00),
(3, 100, '2026-09-03', 6.50);

INSERT INTO saidas (id_produto, quantidade, data_final, valor_unitario) VALUES
(1, 10, '2026-09-10', 3.50),
(2, 5, '2026-09-11', 8.00),
(3, 20, '2026-09-12', 6.50);

CREATE OR REPLACE VIEW vw_estoque AS
SELECT
  id_produto,
  nome,
  categoria,
  unidade_medida,
  quantidade,
  valor_unitario,
  ROUND(quantidade * valor_unitario, 2) AS valor_total
FROM produtos;

-- Exemplos das consultas exigidas:

-- Valor total por categoria
SELECT categoria,
       SUM(quantidade) AS quantidade_total,
       ROUND(SUM(quantidade * valor_unitario),2) AS valor_total
FROM produtos
GROUP BY categoria;

-- Produtos
SELECT * FROM vw_estoque;

-- Saídas em ordem decrescente
SELECT s.id_saida, p.nome, s.quantidade, s.data_final
FROM saidas s JOIN produtos p ON p.id_produto=s.id_produto
ORDER BY s.data_final DESC;

-- Produtos nos limites mínimo/máximo
SELECT nome, quantidade,
       ROUND((quantidade / 100) * 100, 2) AS percentual_nivel
FROM produtos
WHERE quantidade <= 0 OR quantidade >= 100;