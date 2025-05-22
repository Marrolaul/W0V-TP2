import { Types } from "mongoose";
import Ship from "../model/Ship.js";
import {promises as fs} from 'fs';
import Component from "../model/Component.js";

const batchShips = "./templates/ships.json";

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
      res.status(404).send("Ship not found in the database");
    });
  },
  getAllInfoById: (req, res) => {
    Ship.getById(req.params.shipId).then((shipFound) => {
      let fullInfoShip = shipFound.toJSON();
      const infoComponents = [];

      for (const [type, value] of Object.entries(fullInfoShip.componentSlots)) {
        if (value != null) {
          infoComponents.push(Component.getById(value)
            .then((componentToDisplay) => {
              fullInfoShip.componentSlots[type] = componentToDisplay.toJSON();
            }).catch((err) => {
              console.log(err);
              return err;
            })
          );          
        }
      };

      Promise.all(infoComponents).then(() => {
        res.status(200).send(fullInfoShip);
      }).catch((err) => {
        console.log(err);
        res.status(500).send("Internal error");
      });
      
    }).catch((err) => {
      console.log(err);
      res.status(404).send("Ship not found in the database");
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
          res.status(400).send("Cannot add this ship to the database");
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
  batchCreate: (_, res) => {
    fs.readFile(batchShips).then((data) => {
      let shipsList = JSON.parse(data);
      const savedShip = [];

      shipsList.forEach((ship) => {
        let newShip = new Ship(ship);        
        savedShip.push(newShip.save());        
      });

      Promise.all(savedShip).then(() => {
        Ship.getAllShips().then((result) => {
          res.status(200).send(result);
        }).catch((err) => {
          console.log(err);
          res.status(500).send("Internal error");
        });
      }).catch((err) => {
        console.log(err);
        res.status(500).send("Internal error");
      });
    }).catch((err) => {
      console.log(err);
      res.status(500).send("Internal error");
    });
    
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
      res.status(404).send("Ship not found in the database");
    });
  },
  equipComponent: (req, res) => {
    Ship.getById(req.params.shipId).then((shipFound) => {
      Component.getById(req.body.id).then((newComponent) => {
        shipFound.installComponent(newComponent);
        shipFound.update().then((result) => {
          res.status(202).send(result);
        }).catch((err) => {
          console.log(err);
          res.status(500).send("Internal server error");
        });
      }).catch((err) => {
        console.log(err);
        res.status(404).send("Component not found in the database");
      })
    }).catch((err) => {
      console.log(err);
      res.status(404).send("Ship not found in the database");
    })
  }
};
export default ShipController;
