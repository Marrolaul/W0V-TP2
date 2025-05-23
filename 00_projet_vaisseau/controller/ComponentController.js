import { Types } from "mongoose";
import Component from "../model/Component.js";

const ComponentController = {
  getAll: async (req, res) => {
    try {
      const result = await Component.getAll();
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
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
    try {
      const keysToUpdate = Object.keys(req.body);
      const validKeysFound = keysToUpdate.filter(key => Component.validComponentKeys.includes(key))

      if (validKeysFound.length === 0) {
        return res.status(400).send("No valid keys to update component")
      }

      const result = await Component.update(req.params.id, req.body);

      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  create: async (req, res) => {
    if (!req.body) {
      return res.status(422).send("Request must have a body");
    }

    try {
      const result = await Component.create(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  batchCreate: async (req, res) => {
    try {
      const result = await Component.batchCreate();
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  delete: async (req, res) => {
    try {
      const result = await Component.delete(req.params.id)
      res.status(200).send("Component successfully deleted\n\n" + result);
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
};

export default ComponentController;