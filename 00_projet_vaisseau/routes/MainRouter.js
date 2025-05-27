import express from "express";
import ShipRouter from "./ShipRouter.js";
import ComponentRouter from "./ComponentRouter.js";

const MainRouter = express.Router();

MainRouter.use("/ships", ShipRouter);
MainRouter.use("/component", ComponentRouter);

export default MainRouter;
