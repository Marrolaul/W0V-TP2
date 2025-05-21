class Component {
  id;
  model;
  type;
  health;
  targetStat;
  value;
  isFunctionnal;
  isEquiped;
  
  constructor(compObj) {
    this.id = compObj.id || null;
    this.model = compObj.model;
    this.type = compObj.type || null;
    this.health = compObj.health || null;
    this.targetStat = compObj.targetStat || null;
    this.value = compObj.value || null;
    this.isFunctionnal = compObj.isFunctionnal || null;
    this.isEquiped = compObj.isEquiped || null;
  }

  validateObject() {
    if (!this.isValidModel()) {return "Component must have a model name"}
    if (!this.isValidType()) {return "Type is invalid or missing"}
    if (!this.isValidNumber(this.health)) {return "Health value is invalid or missing"}
    if (!this.isValidTargetStat()) {return `Component of type '${this.type}' must have the value '${validComponentStats[this.type]}'`}
    if (!this.isValidNumber(this.value)) {return "Stat value is invalid or missing"}
    if (!this.isValidBool(this.isFunctionnal)) {return "isFunctionnal is invalid or missing"}
    if (!this.isValidBool(this.isEquiped)) {return "isEquiped is invalid or missing"}
  }

  isValidModel() {
    return this.model !== null && this.model !== undefined && this.model !== "";
  }

  isValidType() {
    return this.type in validComponentStats;
  }

  isValidNumber(value) {
    return !isNaN(value) && value > 0;
  }

  isValidTargetStat() {
    return validComponentStats[this.type] === this.targetStat;
  }

  isValidBool(value) {
    return typeof value === 'boolean';
  }

  /**
   * @param {*} source could be a weapon or an asteroid or something else that has a damage value
   */
  takeDamage(source) {
    // TODO : you have to decide how the damage calculation works
  }

  /**
   * @param {*} source could be a weapon or an asteroid or something else that has a damage value
   */
  use(source) {
    // TODO : you have to decide how the damage calculation works
  }

  toJSON() {
    return {
        id: this.id,
        model: this.model,
        type: this.type,
        health: this.health,
        targetStat: this.targetStat,
        value: this.value,
        isFunctionnal: this.isFunctionnal,
        isEquiped: this.isEquiped
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

export const validComponentStats = {
    engine: "speed",
    hull: "hp",
    thruster: "acceleration",
    shield: "shield",
    weapon: "damage",
    radar: "detection",
    navigation: "manoeuvrability"
  }

export const validComponentKeys = ['model', 'type', 'health', 'targetStat', 'value', 'isFunctionnal']

export default Component;