import { Types } from "mongoose";
import ComponentModel from "../model/ComponentModel.js";
import Component from "../model/Component.js";
import validComponentKeys from "../model/Component.js";
import fs from 'fs';

const ComponentController = {
  getAll: async (req, res) => {
    const components = await ComponentModel.find();

    if (!components || components.length === 0) {
      return res.status(404).json({ error: "No components found" })
    }

    res.status(200).json(components);
  },
  getById: async (req, res, next) => {
    try {
      const component = await Component.getById(req.params.id);

      if (!component) {
        next("component_not_found")
      }

      res.status(200).json(component);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res) => {
    const compId = req.params.id;
    const componentData = req.body;

    try {
      const keysToUpdate = Object.keys(componentData);
      const validKeysFound = keysToUpdate.filter(key => validComponentKeys.includes(key))

      if (validKeysFound.length === 0) {
        return res.status(400).json({ error: "No valid keys to update component" })
      }

      const updatedComp = await ComponentModel.findByIdAndUpdate(compId, componentData, { new: true, runValidators: true });

      if (!updatedComp) {
        return res.status(404).json({ error: "Component not found" })
      }

      res.status(200).json(updatedComp);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  create: async (req, res) => {
    if (!req.body) {
      res.status(422).json({ error: "Request must have a body" });
      return;
    }

    try {
      const compObj = new Component(req.body);

      const error = compObj.validateObject();
      if (error) {
        res.status(422).json({ error: error });
        return;
      }

      const newComponent = new ComponentModel(compObj);
      const savedComponent = await newComponent.save();
      res.status(201).json(savedComponent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  batchCreate: async (req, res) => {
    const path = "./templates/components.json";
    const components = JSON.parse(fs.readFileSync(path));

    try {
      const result = await ComponentModel.insertMany(components, { ordered: false })
      res.status(201).json({ result: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  delete: async (req, res) => {
    const compId = req.params.id;

    try {
      const deletedComp = await ComponentModel.findByIdAndDelete(compId);

      if (!deletedComp) {
        return res.status(404).json({ error: "Component not found" });
      }

      res.status(200).json({ message: "Component successfully deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
};
export default ComponentController;
