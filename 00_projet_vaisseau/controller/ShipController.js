import Ship from "../model/Ship.js";
import {promises as fs} from 'fs';
import Component from "../model/Component.js";


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
  batchEquip: (_, res, next) => {
    const shipsList = Ship.getAllShips();
    const componentsToInstallList = Component.getAllNotInstalled();
    const promiseList = [shipsList, componentsToInstallList];

    Promise.all(promiseList).then((data) => {
      let ships = data[0];
      let components = data[1];
      ships.forEach((ship) => {
        let componentsToInstall = [];
        for(const [type, value] of Object.entries(ship.componentSlots)) {
          if (value == null) {
            let componentToInstall = components.find((component) => component.type == type);
            if (componentToInstall) {
              components.splice(components.indexOf(componentToInstall), 1);
              componentsToInstall.push(componentToInstall);
            }
          }
        }
        ship.installMultipleComponents(componentsToInstall);
      });
      res.status(200).send(ships);
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

    const shipPromise = Ship.getById(req.params.shipId);
    const componentPromise = Component.getById(req.body.id);
    const promisesList = [shipPromise, componentPromise];

    Promise.all(promisesList).then((resolvedPromises) => {
      let ship = resolvedPromises[0];
      let component = resolvedPromises[1];
      ship.removeComponent(component.type).then((shipToModify) => {
        shipToModify.installComponent(component).then((modifiedShip) => {
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
