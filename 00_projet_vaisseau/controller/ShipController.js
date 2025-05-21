import { Types } from "mongoose";
import Ship from "../model/Ship.js";

const ShipController = {
  getAll: (_, res) => {
    Ship.getAllShips().then((result) => {
      res.status(200).send(result);
    }).catch((err) => {
      console.log(err);
      res.status(500).send("Internal error");
    });
  },
  getById: (req, res) => {
    Ship.getById(req.params.shipId).then((result) => {
      res.status(200).send(result);
    }).catch((err) => {
      console.log(err);
      res.status(404).send("Ship not found in database");
    });
  },
  create: (req, res) => {
    if (!req.body) {
      res.status(400).send("Invalid request");
    } else {
      let newShip = new Ship(req.body);
      newShip.save().then((result) => {
        res.status(200).send(result);
      }).catch((err) => {
        console.log(err);
        if(err == "invalid_ship")
        {
          res.status(400).send("Cannot add this ship to the database patate");
          return;
        }
        res.status(500).send(err);
      });
    }
  },
  update: (req,res) => {
    if(!req.body) {
      res.status(400).send("Invalid request");
      return;
    }
    Ship.getById(req.params.shipId).then((shipFound) => {
      shipFound.update(req.body, req.params.shipId).then((shipUpdated) => {
        res.status(200).send(shipUpdated);
      }).catch((err) => {
        console.log(err)
        res.status(406).send("Ship has not been updated in the database");
        return;
      });
    }).catch((err) => {
      console.log(err);
      res.status(404).send("Ship not found in database");
      return;
    });
  },
  batchCreate: (req, res) => {
    // TODO : receive an array of ships and create them all. Should be usefull to populate you database
  },
  remove: (req, res) => {
    Ship.getById(req.params.shipId).then((shipFound) => {
      shipFound.delete().then((result) => {
        res.status(204).send(result);
      }).catch((err) => {
        console.log(err);
        res.status(500).send("Internal server error");
      });
    }).catch((err) => {
      console.log(err);
      res.status(404).send("Ship not found in database");
    });
  },
};
export default ShipController;
