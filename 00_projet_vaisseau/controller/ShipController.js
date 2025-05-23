import { Error, Types } from "mongoose";
import Ship from "../model/Ship.js";
import {promises as fs} from 'fs';
import Component from "../model/Component.js";
import { get } from "http";

const batchShips = "./templates/ships.json";

const ShipController = {
  getAll: (_, res, next) => {
    Ship.getAllShips().then((result) => {
      res.status(200).send(result);
    }).catch((err) => {
      next(err);
    });
  },
  getById: (req, res, next) => {
    Ship.getById(req.params.shipId).then((result) => {
      res.status(200).send(result);
    }).catch((err) => {
      next(err);
    });
  },
  getAllInfoById: (req, res, next) => {
    Ship.getById(req.params.shipId).then((shipFound) => {
      let fullInfoShip = shipFound.toJSON();
      const infoComponents = [];

      for (const [type, value] of Object.entries(fullInfoShip.componentSlots)) {
        if (value != null) {
          infoComponents.push(Component.getById(value)
            .then((componentToDisplay) => {
              fullInfoShip.componentSlots[type] = componentToDisplay.toJSON();
            }).catch((err) => {
              next(err);
            })
          );          
        }
      };

      Promise.all(infoComponents).then(() => {
        res.status(200).send(fullInfoShip);
      }).catch(() => {
        next("internal_error");
      });
      
    }).catch((err) => {
      next(err);
    });
  },
  create: (req, res, next) => {
    if (!req.body) {
      next("bad_request");
    } else {
      let newShip = new Ship(req.body);
      newShip.save().then((result) => {
        res.status(200).send(result);
      }).catch((err) => {
        next(err);
      });
    }
  },
  update: (req,res, next) => {
    if(!req.body) {
      next("bad_request");
    }
    Ship.getById(req.params.shipId).then((shipFound) => {
      shipFound.update(req.body, req.params.shipId).then((shipUpdated) => {
        res.status(200).send(shipUpdated);
      }).catch((err) => {
        next(err);
      });
    }).catch((err) => {
      next(err);
    });
  },
  batchCreate: (_, res, next) => {
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
          next(err);
        });
      }).catch((err) => {
        next(err);
      });
    }).catch((err) => {
      next(err);
    });    
  },
  remove: (req, res, next) => {
    Ship.getById(req.params.shipId).then((shipFound) => {
      shipFound.delete().then((result) => {
        res.status(204).send(result);
      }).catch((err) => {
        next(err);
      });
    }).catch((err) => {
      next(err);
    });
  },
  equipComponent: (req, res, next) => {
    const getAllData = [];
    getAllData.push(Ship.getById(req.params.shipId));
    getAllData.push(Component.getById(req.body.id));

    Promise.all(getAllData).then((resolvedPromises) => {
      resolvedPromises[0].removeComponent(resolvedPromises[1].type).then((shipToModify) => {
        shipToModify.installComponent(resolvedPromises[1]).then((modifiedShip) => {
          res.status(202).send(modifiedShip);
        }).catch((err) => {
          next(err);
        });
      }).catch((err) => {
        next(err);
      });
    }).catch((err) => {
      next(err);
    });
  }
};
export default ShipController;
