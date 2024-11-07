// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("./todo.db");

app.use(bodyParser.json());
app.use(express.static("public"));

// Criação da tabela Tarefas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      custo REAL NOT NULL,
      data_limite TEXT NOT NULL,
      ordem INTEGER UNIQUE
    )
  `);
});

// Rota para listar todas as tarefas
app.get("/tarefas", (req, res) => {
    db.all("SELECT * FROM Tarefas ORDER BY ordem", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ data: rows });
    });
  });
  
  // Rota para incluir uma nova tarefa
  app.post("/tarefas", (req, res) => {
    const { nome, custo, data_limite } = req.body;
  
    // Verifica se o nome da tarefa já existe
    db.get("SELECT * FROM Tarefas WHERE nome = ?", [nome], (err, row) => {
      if (row) {
        return res.status(400).json({ error: "Nome da tarefa já existe" });
      }
  
      // Adiciona a nova tarefa ao banco de dados
      db.run(
        "INSERT INTO Tarefas (nome, custo, data_limite, ordem) VALUES (?, ?, ?, (SELECT IFNULL(MAX(ordem), 0) + 1 FROM Tarefas))",
        [nome, custo, data_limite],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ id: this.lastID });
        }
      );
    });
  });
  
  // Rota para editar uma tarefa
  app.put("/tarefas/:id", (req, res) => {
    const { id } = req.params;
    const { nome, custo, data_limite } = req.body;
  
    // Verifica se o novo nome já existe, exceto para a própria tarefa que está sendo editada
    db.get("SELECT * FROM Tarefas WHERE nome = ? AND id != ?", [nome, id], (err, row) => {
      if (row) {
        return res.status(400).json({ error: "Nome da tarefa já existe" });
      }
  
      // Atualiza a tarefa
      db.run(
        "UPDATE Tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?",
        [nome, custo, data_limite, id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: "Tarefa atualizada com sucesso" });
        }
      );
    });
  });
  
  // Rota para excluir uma tarefa
  app.delete("/tarefas/:id", (req, res) => {
    const { id } = req.params;
  
    db.run("DELETE FROM Tarefas WHERE id = ?", [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Tarefa excluída com sucesso" });
    });
  });
  

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
