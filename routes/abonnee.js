const { Router } = require("express");

const createAbonneeRouter = (db) => {
  const router = Router();

  // Création de la table Abonnees (Abonnee_ID, Nom, Prenom, NumTel, Email, Adresse)
  const sql_creer_abone = `CREATE TABLE IF NOT EXISTS Abonnees (
  Abonnee_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Nom VARCHAR(100) NOT NULL,
  Prenom VARCHAR(100) NOT NULL,
  NumTel VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Adresse VARCHAR(100) NOT NULL
);`;

  db.run(sql_creer_abone, (err) => {
    if (err) {
      return console.error(err.message);
    }
    // Alimentation de la table
    const sql_insert = `INSERT INTO Abonnees (Abonnee_ID, Nom, Prenom, NumTel, Email, Adresse) VALUES
  (1, 'Chelghoum', 'Walid', '0540075383', 'walidchelghoum01@gmail.com', 'Oued Edheb 2'),
  (2, 'Habbaaina', 'Mohamed Reda', '0123456789', 'haba@gmail.com', 'Pont Blanc');`;
    db.run(sql_insert, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Alimentation réussie de la table 'Abonnees'");
    });
  });

  // GET /abonnees
  router.get("/", (req, res) => {
    const sql = "SELECT * FROM Abonnees ORDER BY Nom";
    db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./abonnee/abonnees", { model: rows });
    });
  });

  // GET /abonnees/create
  router.get("/create", (req, res) => {
    res.render("./abonnee/create", { model: {} });
  });

  // POST /abonnees/create
  router.post("/create", (req, res) => {
    const sql =
      "INSERT INTO Abonnees (Nom, Prenom, NumTel, Email, Adresse) VALUES (?, ?, ?, ?, ?)";
    const abonnee = [
      req.body.Nom,
      req.body.Prenom,
      req.body.NumTel,
      req.body.Email,
      req.body.Adresse,
    ];
    db.run(sql, abonnee, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/abonnees");
    });
  });

  // GET /abonnees/edit
  router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Abonnees WHERE Abonnee_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./abonnee/edit", { model: row });
    });
  });

  // POST /abonnees/edit
  router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [
      req.body.Nom,
      req.body.Prenom,
      req.body.NumTel,
      req.body.Email,
      req.body.Adresse,
      id,
    ];
    const sql =
      "UPDATE Abonnees SET Nom = ?, Prenom = ?, NumTel = ?, Email = ?, Adresse = ? WHERE (Abonnee_ID = ?)";
    db.run(sql, book, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/abonnees");
    });
  });

  // GET /abonnees/delete
  router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Abonnees WHERE Abonnee_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./abonnee/delete", { model: row });
    });
  });

  // POST /abonnees/delete
  router.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Abonnees WHERE Abonnee_ID = ?";
    db.run(sql, id, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/abonnees");
    });
  });

  // GET /abonnees/compte/:id
  router.get("/compte/:id", (req, res) => {
    const abonneId = req.params.id;
    const sql = `
      SELECT
        a.Abonnee_ID,
        a.Nom,
        a.Prenom,
        a.NumTel,
        a.Email,
        a.Adresse,
        e.Emprunt_ID,
        l.Titre,
        e.Date
      FROM Abonnees a
      LEFT JOIN Emprunts e ON a.Abonnee_ID = e.Abonnee_ID
      LEFT JOIN Livres l ON e.Livre_ID = l.Livre_ID
      WHERE a.Abonnee_ID = ?
    `;

    db.all(sql, [abonneId], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./abonnee/abonnee", { model: rows });
    });
  });

  return router;
};

module.exports = createAbonneeRouter;
