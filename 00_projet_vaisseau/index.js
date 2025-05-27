import express from "express";
import mongoose from "mongoose";
import MainRouter from "./routes/MainRouter.js";

const app = express();
const port = 3000;
const traductionError = {
  internal_error : {
    statusCode : 500,
    en : "Internal server error",
    fr : "Erreur interne du serveur"
  },
  ship_not_found : {
    statusCode : 404,
    en : "Ship not found in the database",
    fr : "Vaisseau non présent dans la base de données"
  },
  component_not_found : {
    statusCode : 404,
    en : "Component not found in the database",
    fr : "Composant non présent dans la base de données"
  },
  bad_request : {
    statusCode : 400,
    en : "Error(s) in the request",
    fr : "Erreure(s) dans la requête"
  },
  no_weapon : {
    statusCode : 400,
    en : "Ship doesn't have a weapon",
    fr : "Le vaisseau n'a pas d'arme"
  },
  no_ammo : {
    statusCode : 400,
    en : "Weapon doesn't have ammo",
    fr : "L'arme n'a pas de munition"
  },
  already_installed : {
    statusCode : 202,
    en : "The requested component is already installed on another ship",
    fr : "La pièce demandée est dans un autre vaisseau"
  }
}

app.use(express.json());

// MichUri = "mongodb+srv://ptrol:8FGNmQmeusALIBVr@cluster0.l5cl5il.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// WilliamUri = "mongodb+srv://dev:dev@cluster0.ylc53cj.mongodb.net/character_app?retryWrites=true&w=majority&appName=Cluster0";

const uri = "mongodb+srv://dev:dev@cluster0.ylc53cj.mongodb.net/tp2?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

mongoose.connect(uri, clientOptions).then(() => console.log("Connected to DB"));


app.use( "/", MainRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(logErrors);
app.use(clientErrorHandler);

function logErrors (err, req, res, next) {
  console.log(err);
  next(err);
}

function clientErrorHandler (err, req, res, next) {
  if (traductionError[err] != undefined) {
    res.status(traductionError[err].statusCode).send(traductionError[err][req.headers.lang]);
  } else {
    res.status(500).send("unexpected_error");
  }
}

