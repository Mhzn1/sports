const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '@Matheus10',
  port: 5432,
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota inicial para servir o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para obter todos os esportes
app.get('/esportes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM esportes');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar esportes', err);
    res.status(500).json({ message: 'Erro ao buscar esportes' });
  }
});

// Rota para obter um esporte por ID
app.get('/esportes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM esportes WHERE id = $1', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Esporte não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar esporte por ID', err);
    res.status(500).json({ message: 'Erro ao buscar esporte por ID' });
  }
});

// Rota para criar um novo esporte ou atualizar um existente
app.post('/esportes', async (req, res) => {
  const { nome, modalidade, tipo } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO esportes (nome, modalidade, tipo) VALUES ($1, $2, $3) RETURNING *',
      [nome, modalidade, tipo]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao criar novo esporte', err);
    res.status(500).json({ message: 'Erro ao criar novo esporte' });
  }
});

// Rota para atualizar um esporte existente
app.put('/esportes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, modalidade, tipo } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE esportes SET nome = $1, modalidade = $2, tipo = $3 WHERE id = $4 RETURNING *',
      [nome, modalidade, tipo, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Esporte não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao atualizar esporte', err);
    res.status(500).json({ message: 'Erro ao atualizar esporte' });
  }
});

// Rota para deletar um esporte
app.delete('/esportes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM esportes WHERE id = $1 RETURNING *', [id]);
    if (rows.length > 0) {
      res.json({ message: 'Esporte deletado com sucesso' });
    } else {
      res.status(404).json({ message: 'Esporte não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao deletar esporte', err);
    res.status(500).json({ message: 'Erro ao deletar esporte' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
