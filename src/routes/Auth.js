const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Inscription
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email déjà utilisé" });

    const user = new User({ firstName, lastName, age, email, password });
    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// Middleware de protection
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide" });
  }
};


// Récupérer tous les utilisateurs
router.get("/users", authMiddleware, async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Exclure le mot de passe
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  });
  
  // Récupérer un utilisateur par son ID
  router.get("/users/:id", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
  });

  
// Déconnexion (optionnel, côté client supprime le token)
router.post("/logout", (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});

module.exports = { authRouter: router, authMiddleware };
