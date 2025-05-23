import ComponentModel from "./ComponentModel.js";
import fs from 'fs';

const validComponentStats = {
  engine: "speed",
  hull: "hp",
  thruster: "acceleration",
  shield: "shield",
  weapon: "damage",
  radar: "detection",
  navigation: "manoeuvrability"
}

class Component {
  id;
  model;
  type;
  health;
  targetStat;
  value;
  amount;
  isEquiped;
  
  constructor(compObj) {
    this.id = compObj.id || null;
    this.model = compObj.model;
    this.type = compObj.type || null;
    this.health = compObj.health || null;
    this.targetStat = compObj.targetStat || null;
    this.value = compObj.value || null;
    this.amount = compObj.amount || 0;
    this.isEquiped = compObj.isEquiped || false;
  }

  validateObject() {
    if (!this.isValidModel()) {return "Component must have a model name"}
    if (!this.isValidType()) {return "Type is invalid or missing"}
    if (!this.isValidNumber(this.health)) {return "Health is invalid or missing"}
    if (!this.isValidTargetStat()) {return `Component of type '${this.type}' must have the value '${validComponentStats[this.type]}'`}
    if (!this.isValidNumber(this.value)) {return "Value is invalid or missing"}
    if (!this.isValidNumber(this.amount)) {return "Amount is invalid or missing"}
    if (!this.isValidBool(this.isEquiped)) {return "isEquiped is invalid or missing"}
    return null;
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

  isWorking() {
    return this.amount > 0 && this.isEquiped;
  }

  /**
   * @param {*} source could be a weapon or an asteroid or something else that has a damage value
   */
  use(source) {
    this.amount -= source;

    if (this.amount < 0) {
      this.amount = 0;
    }
  }

  toJSON() {
    return {
        id: this.id,
        model: this.model,
        type: this.type,
        health: this.health,
        targetStat: this.targetStat,
        value: this.value,
        amount: this.amount,
        isEquiped: this.isEquiped
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  static async getAll() {
    let data = await ComponentModel.find();
    if (!data || data.length === 0) {
      throw new Error("component_not_found");
    }
    return data.map(comp => new Component(comp))
  }

  static async getById(id) {
    let component = await ComponentModel.findById(id);
    if (!component || component === null) {
      throw new Error("component_not_found");
    }
    return new Component(component);
  }

  static async update(id, newData) {
    const updatedComp = await ComponentModel.findByIdAndUpdate(id, newData, { new: true, runValidators: true });
    if (!updatedComp) {
      throw new Error("component_not_found");
    }
    return new Component(updatedComp);
  }

  static async create(data) {
    const newComponent = new Component(data);
    const error = newComponent.validateObject();
    if (error) {
      throw new Error(error)
    }
    const newComponentModel = new ComponentModel(newComponent);
    const savedComponent = await newComponentModel.save();
    return savedComponent;
  }

  static async batchCreate() {
    const path = "./templates/components.json";
    const data = JSON.parse(fs.readFileSync(path));

    if (!data || data.length === 0) {
      throw new Error("Data file not found")
    }

    const components = data.map(comp => new Component(comp));

    let error = null;

    components.forEach(c => {
      error = c.validateObject();
      if (error) {
        throw new Error(error)
      }
    })
    const result = await ComponentModel.insertMany(components);
    return result;
  }

  static async delete(id) {
    const deletedComp = await ComponentModel.findByIdAndDelete(id);
    if (!deletedComp) {
      throw new Error("Component not found")
    }
    return deletedComp;
  }

  static validComponentKeys = ['model', 'type', 'health', 'targetStat', 'value', 'amount', 'isEquiped'];
}

export default Component;