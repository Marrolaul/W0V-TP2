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

  installMultipleComponents(components) {
    components.forEach((component) => {
      if (!this.componentSlots[component.type]) {
        this.componentSlots[component.type] = component.id;
        component.install();
        if (component.targetStat != "damage")
        {
          this.stats[component.targetStat] += component.value;
        }
      }
    });
    this.update();
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
      }).catch(() => {
        return rej("component_to_remove_not_found");
      });
    });
  }

  move() {
    return new Promise((res, rej) => {      
      let distanceMoved = 0;
      let speed = 0;
      let acceleration = 0;
      let time = 3;
      
      let enginePromise = null;
      let thrusterPromise = null;

      const componentsPromises = [];
  
      if(this.componentSlots.engine != null) {
        componentsPromises.push(enginePromise = Component.getById(this.componentSlots.engine).catch((err) => {
          return rej(err);
        }));
      }
      if(this.componentSlots.thruster != null) {
        componentsPromises.push(thrusterPromise = Component.getById(this.componentSlots.thruster).catch((err) => {
          return rej(err);
        }));
      }
  
      Promise.all(componentsPromises).then((ComponentUse) => {
        ComponentUse.forEach((component) => {
          if(component.isWorking()) {
            if(component.type == "engine") {
              speed = this.stats.speed;
            } else {
              acceleration = this.stats.acceleration;
            }
            component.use(5);
          }
        });

        distanceMoved = speed + ((1/2)*(acceleration * acceleration) * (time * time));

        if (distanceMoved == 0) {
          return res("The ship cannot move!");
        }
        return res(`The ship moved ${distanceMoved} meters!`);
      }).catch((err) => {
        return rej(err);
      });
    });
  }

  detectOtherShips(shipLists) {
    const detectedShips = [];
    shipLists.forEach((ship) => {
      if(ship.id != this.id && ship.stats.stealth < this.stats.detection) {
        detectedShips.push(ship);
      }
    });
    return detectedShips;
  }

  /**
   * @param {*} defender
   */
  async attack(defender) {
    const result = {
      success: false,
      message: "",
      damage: null,
      defender: null
    }

    const weapon = this.componentSlots.weapon ? await Component.getById(this.componentSlots.weapon) : null;

    if (weapon === null) {
      throw new Error("no_weapon")
    }
    
    if (!weapon?.isWorking()) {
      throw new Error("no_ammo")
    }

    let damage = Number(weapon.value);

    const defense = (defender?.stats?.shield || 0)+ (defender?.stats?.navigation || 0);

    damage -= defense;
    result.damage = damage;

    if (damage > 0) {
      defender.takeDamage(damage);
      result.success = true;
      result.message = `${this.name} has hit ${defender.name} for ${damage} damage.`;
    }
    
    weapon.use(1);
    await Component.update(weapon.id, weapon);

    result.defender = {
      name: defender.name,
      remainingHealth: defender.stats.health > 0 ? defender.stats.health : 0
    }

    if (defender.stats.health <= 0) {
      result.message += ` ${defender.name} is dead`;
      defender.delete();
    } else {
      defender.update();
    }
    
    return result;
  }

  /**
   * @param {*} damage
   */
  async takeDamage(damage) {
    this.stats.health -= damage;
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
        Object.values(this.componentSlots).forEach(id => {
          if (id !== null) {
            Component.delete(id);
          }
        })
      }).then(() => {
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
