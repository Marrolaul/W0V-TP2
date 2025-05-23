import { json } from "express";
import ShipModel from "./ShipModel.js";
import Component from "./Component.js";

class Ship {
  id;
  name;
  type; // type: String = "fighter"
  stats = {
    baseHealth: null,
    health: null,
    speed: null,
    acceleration: null,
    shield: null,
    detection: null,
    stealth: null,
    maneuverability: null
  };
  componentSlots = {
    thruster: null,
    hull: null,
    shield: null,
    engine: null,
    weapon: null,
    radar: null,
    navigation: null
  };

  constructor(shipObj) {
    this.id = shipObj.id || shipObj._id || null;

    this.name = String(shipObj.name);
    if(this.name == 'undefined' || this.name == 'null') {
      this.name = "unidentified ship";
    }

    this.type = shipObj.type || null;
    this.stats =  shipObj.stats || {
      baseHealth: 5,
      health: 5,
      speed: 0,
      acceleration: 0,
      shield: 0,
      detection: 0,
      stealth: 0,
      maneuverability: 0
    };
    this.componentSlots = shipObj.componentSlots || {
      thruster: null, // class: component
      hull: null, // class: component
      shield: null, // class: component
      engine: null, // class: component
      weapon: null, // class: component
      radar: null, // class: component
      navigation: null // class: component
    };
  }

  isValidShip() {
    let validShip = this.isTypeValid();
    if(validShip) {
      validShip = this.isStatsValid();
    }
    return validShip;
  }

  isTypeValid() {
    switch(this.type) {
      case "fighter":
        return true;
      case "destroyer":
        return true;
      case "cruiser":
        return true;
      default:
        return false;
    }
  }

  isStatsValid() {
    let allStatsValid = true;
    for(let[_, value] of Object.entries(this.stats)) {
      allStatsValid = allStatsValid && typeof value === "number" && value >= 0;
    }
    return allStatsValid;
  }

  installComponent(componentToInstall) {
    return new Promise((res, rej) => {
      if(componentToInstall.isEquiped == true) {
        return rej("already_installed");
      }
      this.componentSlots[componentToInstall.type] = componentToInstall.id;
      componentToInstall.install();
      if (componentToInstall.targetStat != "damage")
      {
        this.stats[componentToInstall.targetStat] += componentToInstall.value;
      }
      this.update().then((updatedShip) => {
          return res(updatedShip);
        }).catch((err) => {
          return rej(err);
      });
    })
  }

  removeComponent(componentType) {
    return new Promise((res, rej) => {
      if (this.componentSlots[componentType] == null) {
        return res(this);
      }
      Component.getById(this.componentSlots[componentType]).then((componentToRemove) => {
          this.stats[componentToRemove.targetStat] -= componentToRemove.value;
          this.componentSlots[componentType] = null;
          componentToRemove.uninstall();
          return res(this);
        }).catch((err) => {
          return rej(err);
      });
    });
  }

  move() {
    if (
      !this.componentSlots?.engine?.isWorking() ||
      !this.componentSlots?.thruster?.isWorking()
    ) {
      // TODO : the ship cant move if it doesnt have a working engine
    }
  }

  /**
   * @param {*} target could be a ship or an asteroid or something else that has a health value
   */
  attack(target) {
    if (
      !this.componentSlots?.weapon?.isWorking() ||
      !this.componentSlots?.weapon?.hasAmmo()
    ) {
      // TODO : the ship cant attack if it doesnt have a working weapon or ammo
    }
  }

  /**
   * @param {*} source could be a weapon or an asteroid or something else that has a damage value
   */
  takeDamage(source) {
    // TODO : you have to decide how the damage calculation works
  }

  save() {
    return new Promise((res, rej) => {
      if(!this.isValidShip()) {
        return rej("bad_request");
      }
      let parsedShip = {...this};
      ShipModel.create(parsedShip).then((jsonData) => {
          return res(new Ship(jsonData));
        }).catch(() => {
          return rej("internal_error");
        });
    });
  }

  update(requestBody = this, shipId = this.id) {
    return new Promise((res, rej) => {
      let filter = {_id: shipId};
      let updatedShip = new Ship({...this, ...requestBody});
      if (!updatedShip.isValidShip()) {
        return rej("bad_request");
      }
      ShipModel.findByIdAndUpdate(filter, updatedShip, {new: true}).then((newShip) => {
        return res(new Ship(newShip));
      }).catch (() => {
        return rej("internal_error");
      });
    });
  }

  delete() {
    return new Promise((res, rej) => {
      ShipModel.deleteOne({_id: this.id}).then(() => {
        return res(`${this.name} has been deleted.`);
      }).catch(() => {
        return rej("internal_error");
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      stats: {
        baseHealth: this.stats.baseHealth,
        health: this.stats.health,
        speed: this.stats.speed,
        acceleration: this.stats.acceleration,
        shield: this.stats.shield,
        detection: this.stats.detection,
        stealth: this.stats.stealth,
        maneuverability: this.stats.maneuverability
      },
      componentSlots: {
        thruster: this.componentSlots.thruster,
        hull: this.componentSlots.hull,
        shield: this.componentSlots.shield,
        engine: this.componentSlots.engine,
        weapon: this.componentSlots.weapon,
        radar: this.componentSlots.radar,
        navigation: this.componentSlots.navigation
      },
    };
  }

  toString() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      type: this.type,
      stats: {
        baseHealth: this.stats.baseHealth,
        health: this.stats.health,
        speed: this.stats.speed,
        acceleration: this.stats.acceleration,
        shield: this.stats.shield,
        detection: this.stats.detection,
        stealth: this.stats.stealth,
        maneuverability: this.stats.maneuverability
      },
      componentSlots: {
        thruster: this.componentSlots.thruster,
        hull: this.componentSlots.hull,
        shield: this.componentSlots.shield,
        engine: this.componentSlots.engine,
        weapon: this.componentSlots.weapon,
        radar: this.componentSlots.radar,
        navigation: this.componentSlots.navigation
      },
    });
  }

  static getById(shipId) {
    return new Promise((res, rej) => {
      ShipModel.findById(shipId).then((ship) => {
        return res(new Ship(ship));
      }).catch(() => {
        return rej("ship_not_found");
      });
    });
  }

  static getAllShips() {
    return new Promise((res, rej) => {
      ShipModel.find().then((data) => {
        let listShips = [];
        data.forEach((ship) => {
          let shipToAdd = new Ship(ship);
          listShips.push(shipToAdd);
        });
        return res(listShips);
      }).catch(() => {
        return rej("internal_error");
      })
    })
  }
}

export default Ship;
