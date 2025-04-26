require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRouter = require("./routes/Auth");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/maxdb";

// Connexion à MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB :", err));

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
