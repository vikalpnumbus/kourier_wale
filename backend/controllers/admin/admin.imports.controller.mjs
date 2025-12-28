import ImportsService from "../../services/admin/admin.imports.service.mjs";
import ImportsHandlerFactory from "../../services/admin/imports/imports.factory.mjs";
import { readCsvAsArray } from "../../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    const { type } = req.body;
    const { id: userId } = req.user;

    if (!req.files || req.files?.length != 1) {
      const error = new Error("File Required and only 1 .csv file allowed to be uploaded.");
      error.status = 400;
      throw error;
    }

    let rows = await readCsvAsArray(Buffer.from(req.files[0].buffer));

    if (!rows || rows.length == 0) {
      const error = new Error("Empty file is not accepatable.Add some data before proceeding.");
      error.status = 422;
      throw error;
    }

    const importHandler = ImportsHandlerFactory.getImportsHandler(type);
    const validateHeaders = await importHandler?.validateHeaders(Object.keys(rows[0]));
    if (!validateHeaders) throw importHandler.error;

    const result = await ImportsService.create({ userId, type, file: req.files?.[0] });

    if (!result) {
      throw ImportsService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, userId } = req.query;

    const result = await ImportsService.read({ id, page, limit, userId });
    if (!result) {
      throw ImportsService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
