const { Router } = require("express");

const createLivreRouter = (db) => {
  const router = Router();

  // Création de la table Livres (Livre_ID, Titre, Auteur, Commentaires)
  const sql_creer_livre = `CREATE TABLE IF NOT EXISTS Livres (
    Livre_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Titre VARCHAR(100) NOT NULL,
    Auteur VARCHAR(100) NOT NULL,
    Quantite INTEGER NOT NULL,
    Commentaires TEXT
  );`;

  db.run(sql_creer_livre, (err) => {
    if (err) {
      return console.error(err.message);
    }

    console.log("Création réussie de la table 'Livres'");
    // Alimentation de la table
    const sql_insert = `INSERT INTO Livres (Livre_ID, Titre, Auteur, Quantite, Commentaires) VALUES
    (1, 'Mrs. Bridge', 'Evan S. Connell', '10', 'Premier de la série'),
    (2, 'Mr. Bridge', 'Evan S. Connell', '5', 'Second de la série'),
    (3, 'L''ingénue libertine', 'Colette', '3', 'Minne + Les égarements de Minne');`;
    db.run(sql_insert, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Alimentation réussie de la table 'Livres'");
    });
  });

  // GET /livres
  router.get("/", (req, res) => {
    const sql = "SELECT * FROM Livres ORDER BY Titre";
    db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./livre/livres", { model: rows });
    });
  });

  // GET /create/livre
  router.get("/create", (req, res) => {
    res.render("./livre/create", { model: {} });
  });

  // POST /create/livre
  router.post("/create", (req, res) => {
    const sql =
      "INSERT INTO Livres (Titre, Auteur, Quantite, Commentaires) VALUES (?, ?, ?, ?)";
    const book = [req.body.Titre, req.body.Auteur, req.body.Commentaires];
    db.run(sql, book, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/livres");
    });
  });

  // GET /edit/livre
  router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Livres WHERE Livre_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./livre/edit", { model: row });
    });
  });

  // POST /edit/livre
  router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [
      req.body.Titre,
      req.body.Auteur,
      req.body.Quantite,
      req.body.Commentaires,
      id,
    ];
    const sql =
      "UPDATE Livres SET Titre = ?, Auteur = ?, Quantite = ?, Commentaires = ? WHERE (Livre_ID = ?)";
    db.run(sql, book, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/livres");
    });
  });

  // GET /delete/livre
  router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Livres WHERE Livre_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./livre/delete", { model: row });
    });
  });

  // POST /delete/livre
  router.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Livres WHERE Livre_ID = ?";
    db.run(sql, id, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/livres");
    });
  });

  // Affichage par livre
  // GET /livres/details/:id
  router.get("/details/:id", (req, res) => {
    const livreId = req.params.id;
    const sql = `
        SELECT
          l.Livre_ID,
          l.Titre,
          l.Auteur,
          l.Commentaires,
          l.Quantite,
          e.Emprunt_ID,
          a.Nom,
          a.Prenom,
          e.Date
        FROM Livres l
        LEFT JOIN Emprunts e ON l.Livre_ID = e.Livre_ID
        LEFT JOIN Abonnees a ON e.Abonnee_ID = a.Abonnee_ID
        WHERE l.Livre_ID = ?
      `;

    db.all(sql, [livreId], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }

      res.render("./livre/livre", { model: rows });
    });
  });

  return router;
};

module.exports = createLivreRouter;
