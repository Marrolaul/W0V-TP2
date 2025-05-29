import express from "express";
import ComponentController from "../controller/ComponentController.js";

const ComponentRouter = express.Router();

ComponentRouter.get("/get/all", ComponentController.getAll);
ComponentRouter.get("/get/:id", ComponentController.getById);
ComponentRouter.put("/update/:id", ComponentController.update);
ComponentRouter.post("/create", ComponentController.create);
ComponentRouter.post("/batch", ComponentController.batchCreate);
ComponentRouter.delete("/delete/:id", ComponentController.delete);

export default ComponentRouter;