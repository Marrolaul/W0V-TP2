import express from "express";
import ShipController from "../controller/ShipController.js";

const ShipRouter = express.Router();

ShipRouter.get("/", ShipController.getAll);
ShipRouter.get("/:shipId", ShipController.getById);
ShipRouter.get("/completeInfo/:shipId", ShipController.getAllInfoById);
ShipRouter.get("/move/:shipId", ShipController.move);
ShipRouter.get("/radar/:shipId", ShipController.detectShips);

ShipRouter.post("/batch",ShipController.batchCreate);
ShipRouter.post("/create", ShipController.create);
ShipRouter.post("/attack", ShipController.attack);

ShipRouter.put("/update/:shipId", ShipController.update);
ShipRouter.put("/equipComponent/:shipId", ShipController.equipComponent);

ShipRouter.delete("/delete/:shipId", ShipController.remove);

export default ShipRouter;
