import express from "express";
import mongoose from "mongoose";
import MainRouter from "./routes/MainRouter.js";

const app = express();
const port = 3000;

app.use(express.json());

const uri = "CHAINE_DE_CONNEXION";
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

mongoose.connect(uri, clientOptions).then(() => console.log("Connected to DB"));

app.use("/", MainRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
