import express from "express";
import ComponentController from "../controller/ComponentController.js";

const ComponentRouter = express.Router();

ComponentRouter.get("/", ComponentController.getAll);
ComponentRouter.get("/:id", ComponentController.getById);
ComponentRouter.put("/:id", ComponentController.update);
ComponentRouter.post("/", ComponentController.create);
ComponentRouter.post("/batch", ComponentController.batchCreate);
ComponentRouter.delete("/:id", ComponentController.delete);



// TODO : you have to implements the routes to use the component
ComponentRouter.post("/:shipId/attack", () => {
  // TODO: req.body should somewhat look like : { defenderShipId: ID}
  // the response could be something like { ammoCount: Number, defenderShip: Ship}
  // or { currentShip: Ship, defenderShip: Ship}
});

export default ComponentRouter;