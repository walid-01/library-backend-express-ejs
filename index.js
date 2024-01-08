const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Création du serveur Express
const app = express();

// Configuration du serveur
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// Connexion à la base de donnée SQlite
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connexion réussie à la base de données 'apptest.db'");
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("Serveur démarré (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
  res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

const livreRoutes = require("./routes/livre")(db);
const abonneeRoutes = require("./routes/abonnee")(db);
const empruntRoutes = require("./routes/emprunt")(db);

// Routes
app.use("/livres", livreRoutes);
app.use("/abonnees", abonneeRoutes);
app.use("/emprunts", empruntRoutes);
