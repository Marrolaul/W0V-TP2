class Ship {
  id;
  name;
  type; // type: String = "fighter"
  baseSpeed;
  baseHealth;
  health;
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
    this.name = shipObj.name || null;
    this.type = shipObj.type || null;
    this.baseSpeed = shipObj.baseSpeed || null;
    this.baseHealth = shipObj.baseHealth || null;
    this.health = shipObj.health || null;
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

  installcomponent(component, slot) {}

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

  save(callback) {}

  remove(callback) {}

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      className: this.className,
      type: this.type,
      baseSpeed: this.baseSpeed,
      baseHealth: this.baseHealth,
      health: this.health,
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
      className: this.className,
      type: this.type,
      baseSpeed: this.baseSpeed,
      baseHealth: this.baseHealth,
      health: this.health,
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
}

export default Ship;
