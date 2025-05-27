import { Types } from "mongoose";
import Component from "../model/Component.js";

const ComponentController = {
  getAll: async (req, res, next) => {
    try {
      const result = await Component.getAll();
      res.status(200).send(result);
    } catch (err) {
      next(err.message);
    }
  },
  getById: async (req, res, next) => {
    try {
      const component = await Component.getById(req.params.id);
      res.status(200).json(component);
    } catch (err) {
      next(err.message);
    }
  },
  update: async (req, res, next) => {
    try {
      const keysToUpdate = Object.keys(req.body);
      const validKeysFound = keysToUpdate.filter(key => Component.validComponentKeys.includes(key))

      if (validKeysFound.length === 0) {
        next("bad_request")
      }

      const result = await Component.update(req.params.id, req.body);

      res.status(200).send(result);
    } catch (err) {
      next(err.message);
    }
  },
  create: async (req, res, next) => {
    if (!req.body) {
      next("bad_request");
    }

    try {
      const result = await Component.create(req.body);
      res.status(201).send(result);
    } catch (err) {
      next(err.message);
    }
  },
  batchCreate: async (req, res, next) => {
    try {
      const result = await Component.batchCreate();
      res.status(201).send(result);
    } catch (err) {
      next(err.message);
    }
  },
  delete: async (req, res, next) => {
    try {
      const result = await Component.delete(req.params.id)
      res.status(200).send("Component successfully deleted\n\n" + result);
    } catch (err) {
      next(err.message)
    }
  }
};

export default ComponentController;