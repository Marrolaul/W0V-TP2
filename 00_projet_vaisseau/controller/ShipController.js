import { Error, Types } from "mongoose";
import Ship from "../model/Ship.js";
import {promises as fs} from 'fs';
import Component from "../model/Component.js";
import { get } from "http";
import { arrayBuffer } from "stream/consumers";

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
  move: (req,res,next) => {
    Ship.getById(req.params.shipId).then((ship) => {
      ship.move().then((result) => {
        res.status(200).send(result);
      }).catch ((err) => {
        next(err);
      });
    }).catch((err) => {
      next(err);
    });
  },
  detectShips: (req,res,next) => {
    const detectionPromise = [];
    detectionPromise.push(Ship.getAllShips());
    detectionPromise.push(Ship.getById(req.params.shipId));
    
    Promise.all(detectionPromise).then((data) => {
      let shipSearching = data[1];
      const detectedShips = shipSearching.detectOtherShips(data[0]);
      if (detectedShips.length == 0) {
        res.status(200).send("No other ship detected");
      } else {
        res.status(200).send(detectedShips);
      }
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
  /*batchEquip: (_, res, next) => {
    const componentPromises = [];
    Ship.getAllShips().then((shipsList) => {
      shipsList.forEach(async (ship) => {
        for(const [type, value] of Object.entries(ship.componentSlots)) {
          if (value == null) {
            let component;
            try {
              component = await Component.getComponentByType(type);
            } catch (err) {
              throw err;
            }
            componentPromises.push(ship.installComponent(component).catch((err) => {
              throw err;
            }));                    
          }
        }
      });

      Promise.all(componentPromises).then(() => {
        Ship.getAllShips().then((results) => {
          res.status(200).send(results);
        }).catch((err) => {
          next(err);
        })
      })
    }).catch((err) => {
      next(err);
    });
  },*/
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
  },
  attack: async (req, res, next) => {
    try {
      const { attackerId, defenderId } = req.body;

      const [ attacker, defender ] = await Promise.all([
        Ship.getById(attackerId),
        Ship.getById(defenderId)
      ]);

      if (!attacker || !defender) {
        next("bad_request")
      }

      const result = await attacker.attack(defender);
      res.status(200).send(result);
    } catch (err) {
      next(err.message);
    }
  }
};
export default ShipController;
