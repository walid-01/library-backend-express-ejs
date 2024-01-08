const { Router } = require("express");

const createAbonneeRouter = (db) => {
  const router = Router();

  // Création de la table Emprunts (Emprunt_ID, Livre_ID, Abonnee_ID, Date)
  const sql_create_emprunts = `CREATE TABLE IF NOT EXISTS Emprunts (
    Emprunt_ID INTEGER PRIMARY KEY,
    Livre_ID INTEGER,
    Abonnee_ID INTEGER,
    Date DATE,
    FOREIGN KEY (Livre_ID) REFERENCES Livres(Livre_ID),
    FOREIGN KEY (Abonnee_ID) REFERENCES Abonnes(Abonnee_ID)
  );`;
  db.run(sql_create_emprunts, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Création réussie de la table 'Emprunts'");
  });

  // GET /emprunts
  router.get("/", (req, res) => {
    const sql = `
      SELECT
        e.Emprunt_ID,
        a.Nom,
        a.Prenom,
        l.Titre,
        e.Date
      FROM Emprunts e
      INNER JOIN Abonnees a ON e.Abonnee_ID = a.Abonnee_ID
      INNER JOIN Livres l ON e.Livre_ID = l.Livre_ID
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("./emprunt/emprunts", { model: rows });
    });
  });

  // GET /emprunts/create
  router.get("/create", (req, res) => {
    const sqlAbonnees =
      "SELECT Abonnee_ID, Nom, Prenom FROM Abonnees ORDER BY Nom";
    db.all(sqlAbonnees, [], (errAbonnees, abonnees) => {
      if (errAbonnees) {
        return console.log(errAbonnees.message);
      }
      const sqlLivres = "SELECT Livre_ID, Titre FROM Livres ORDER BY Titre";
      db.all(sqlLivres, [], (errLivres, livres) => {
        if (errLivres) {
          return console.log(errLivres.message);
        }
        res.render("./emprunt/create", {
          model: {},
          abonnees: abonnees,
          livres: livres,
        });
      });
    });
  });

  // POST /emprunts/create
  router.post("/create", (req, res) => {
    const abonneId = req.body.Abonnee_ID;
    const livreId = req.body.Livre_ID;
    const empruntDate = req.body.Date;

    const checkQuantitySql = "SELECT Quantite FROM Livres WHERE Livre_ID = ?";
    db.get(checkQuantitySql, [livreId], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      const currentQuantity = row.Quantite;
      if (currentQuantity > 0) {
        const insertEmpruntSql =
          "INSERT INTO Emprunts (Abonnee_ID, Livre_ID, Date) VALUES (?, ?, ?)";
        const empruntParams = [abonneId, livreId, empruntDate];

        db.run(insertEmpruntSql, empruntParams, (err) => {
          if (err) {
            return console.error(err.message);
          }
          const updateQuantitySql =
            "UPDATE Livres SET Quantite = Quantite - 1 WHERE Livre_ID = ?";
          db.run(updateQuantitySql, [livreId], (err) => {
            if (err) {
              return console.error(err.message);
            }
            res.redirect("/emprunts");
          });
        });
      } else {
        res.send("Quantité insuffisante pour ce livre.");
      }
    });
  });

  // GET /emprunts/edit
  router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Emprunts WHERE Emprunt_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.log(err.message);
      }
      const sqlAbonnees =
        "SELECT Abonnee_ID, Nom, Prenom FROM Abonnees ORDER BY Nom";

      db.all(sqlAbonnees, [], (errAbonnees, abonnees) => {
        if (errAbonnees) {
          return console.log(errAbonnees.message);
        }
        const sqlLivres = "SELECT Livre_ID, Titre FROM Livres ORDER BY Titre";
        db.all(sqlLivres, [], (errLivres, livres) => {
          if (errLivres) {
            return console.log(errLivres.message);
          }
          res.render("./emprunt/edit", {
            model: row,
            abonnees: abonnees,
            livres: livres,
          });
        });
      });
    });
  });

  // POST /emprunts/edit
  router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const emprunt = [req.body.Abonnee_ID, req.body.Livre_ID, req.body.Date, id];
    const sql =
      "UPDATE emprunts SET Abonnee_ID = ?, Livre_ID = ?, Date = ? WHERE (Emprunt_ID = ?)";
    db.run(sql, emprunt, (err) => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/emprunts");
    });
  });

  // GET /emprunts/delete
  router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Emprunts WHERE Emprunt_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      const sqlAbonne = "SELECT Nom, Prenom FROM Abonnees WHERE Abonnee_ID = ?";

      db.get(sqlAbonne, row.Abonnee_ID, (errAbonne, abonne) => {
        if (errAbonne) {
          return console.log(errAbonne.message);
        }
        const sqlLivre = "SELECT Titre FROM Livres WHERE Livre_ID = ?";
        db.get(sqlLivre, row.Abonnee_ID, (errLivre, livre) => {
          if (errLivre) {
            return console.log(errLivre.message);
          }
          res.render("./emprunt/delete", {
            model: row,
            abonne: abonne,
            livre: livre,
          });
        });
      });
    });
  });

  // POST /emprunts/delete
  router.post("/delete/:id", (req, res) => {
    const empruntId = req.params.id;
    const getLivreIdSql = "SELECT Livre_ID FROM Emprunts WHERE Emprunt_ID = ?";
    db.get(getLivreIdSql, [empruntId], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      const livreId = row.Livre_ID;
      const deleteEmpruntSql = "DELETE FROM Emprunts WHERE Emprunt_ID = ?";
      db.run(deleteEmpruntSql, [empruntId], (err) => {
        if (err) {
          return console.error(err.message);
        }
        const incrementQuantiteSql =
          "UPDATE Livres SET Quantite = Quantite + 1 WHERE Livre_ID = ?";
        db.run(incrementQuantiteSql, [livreId], (err) => {
          if (err) {
            return console.error(err.message);
          }
          res.redirect("/emprunts");
        });
      });
    });
  });

  return router;
};

module.exports = createAbonneeRouter;
