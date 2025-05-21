import express from "express";
import mongoose from "mongoose";
import MainRouter from "./routes/MainRouter.js";

const app = express();
const port = 3000;

app.use(express.json());

// mongodb+srv://dev:dev@cluster0.ylc53cj.mongodb.net/character_app?retryWrites=true&w=majority&appName=Cluster0
const uri = "mongodb+srv://dev:dev@cluster0.ylc53cj.mongodb.net/character_app?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

mongoose.connect(uri, clientOptions).then(() => console.log("Connected to DB"));

app.use("/", MainRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
