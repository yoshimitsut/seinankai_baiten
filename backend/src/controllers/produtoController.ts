import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Produto } from '../types';

export const listProdutos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busca, categoria } = req.query;
    let sql = 'SELECT * FROM produtos WHERE ativo = TRUE';
    const params: any[] = [];

    if (categoria && typeof categoria === 'string') {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    if (busca && typeof busca === 'string') {
      sql += ' AND (nome LIKE ? OR codigo_barras LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }

    sql += ' ORDER BY categoria ASC, nome ASC';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ mensagem: 'Erro interno ao consultar produtos' });
  }
};

export const getProdutoByCodigo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { codigo } = req.params;
    if (!codigo) {
      res.status(400).json({ mensagem: 'Código de barras não informado' });
      return;
    }

    const codigoStr = String(codigo).trim();

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM produtos WHERE codigo_barras = ? AND ativo = TRUE LIMIT 1',
      [codigoStr]
    );

    if (rows.length === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado com este código de barras' });
      return;
    }

    res.json(rows[0] as Produto);
  } catch (error) {
    console.error('Erro ao buscar produto por código:', error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar produto' });
  }
};

export const getProdutoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM produtos WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado' });
      return;
    }

    res.json(rows[0] as Produto);
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar produto' });
  }
};

export const createProduto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      codigo_barras,
      nome,
      descricao = '',
      preco_venda,
      preco_custo = 0,
      estoque_atual = 0,
      estoque_minimo = 5,
      categoria = 'Geral',
    } = req.body;

    if (!codigo_barras || !nome || preco_venda === undefined) {
      res.status(400).json({ mensagem: 'Código de barras, nome e preço de venda são obrigatórios.' });
      return;
    }

    if (Number(preco_venda) <= 0) {
      res.status(400).json({ mensagem: 'O preço de venda deve ser maior que zero.' });
      return;
    }

    // Verificar se o código de barras já existe
    const [existentes] = await pool.query<RowDataPacket[]>(
      'SELECT id, ativo FROM produtos WHERE codigo_barras = ?',
      [codigo_barras.trim()]
    );

    if (existentes.length > 0) {
      if (existentes[0].ativo) {
        res.status(409).json({ mensagem: 'Já existe um produto ativo cadastrado com este código de barras.' });
        return;
      } else {
        // Reativar e atualizar caso estivesse desativado
        await pool.query(
          `UPDATE produtos 
           SET ativo = TRUE, nome = ?, descricao = ?, preco_venda = ?, preco_custo = ?, estoque_atual = ?, estoque_minimo = ?, categoria = ? 
           WHERE id = ?`,
          [nome, descricao, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria, existentes[0].id]
        );
        res.status(200).json({ id: existentes[0].id, mensagem: 'Produto reativado e atualizado com sucesso!' });
        return;
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO produtos (codigo_barras, nome, descricao, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [codigo_barras.trim(), nome.trim(), descricao, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria]
    );

    // Registra entrada inicial de estoque se for maior que zero
    if (Number(estoque_atual) > 0) {
      await pool.query(
        'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, "ENTRADA", ?, "Estoque inicial no cadastro")',
        [result.insertId, estoque_atual]
      );
    }

    res.status(201).json({
      id: result.insertId,
      codigo_barras,
      nome,
      preco_venda,
      estoque_atual,
      mensagem: 'Produto cadastrado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ mensagem: 'Erro interno ao cadastrar produto' });
  }
};

export const updateProduto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      codigo_barras,
      nome,
      descricao,
      preco_venda,
      preco_custo,
      estoque_atual,
      estoque_minimo,
      categoria,
    } = req.body;

    const [produtoAtual] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM produtos WHERE id = ? AND ativo = TRUE',
      [id]
    );

    if (produtoAtual.length === 0) {
      res.status(404).json({ mensagem: 'Produto não encontrado.' });
      return;
    }

    // Se mudou código de barras, checar se não conflita com outro produto
    if (codigo_barras && codigo_barras !== produtoAtual[0].codigo_barras) {
      const [duplicados] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?',
        [codigo_barras.trim(), id]
      );
      if (duplicados.length > 0) {
        res.status(409).json({ mensagem: 'Este código de barras já está em uso por outro produto.' });
        return;
      }
    }

    const novoEstoque = estoque_atual !== undefined ? Number(estoque_atual) : produtoAtual[0].estoque_atual;
    const diferencaEstoque = novoEstoque - produtoAtual[0].estoque_atual;

    await pool.query(
      `UPDATE produtos SET 
        codigo_barras = COALESCE(?, codigo_barras),
        nome = COALESCE(?, nome),
        descricao = COALESCE(?, descricao),
        preco_venda = COALESCE(?, preco_venda),
        preco_custo = COALESCE(?, preco_custo),
        estoque_atual = ?,
        estoque_minimo = COALESCE(?, estoque_minimo),
        categoria = COALESCE(?, categoria)
       WHERE id = ?`,
      [
        codigo_barras ? codigo_barras.trim() : null,
        nome ? nome.trim() : null,
        descricao,
        preco_venda,
        preco_custo,
        novoEstoque,
        estoque_minimo,
        categoria,
        id,
      ]
    );

    // Registra movimentação de ajuste se o estoque foi alterado manualmente
    if (diferencaEstoque !== 0) {
      await pool.query(
        'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, "AJUSTE_MANUAL", ?, "Ajuste manual via edição de produto")',
        [id, diferencaEstoque]
      );
    }

    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar produto' });
  }
};

export const deleteProduto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Realiza soft delete para manter integridade das vendas passadas
    await pool.query('UPDATE produtos SET ativo = FALSE WHERE id = ?', [id]);
    res.json({ mensagem: 'Produto desativado com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir produto' });
  }
};
