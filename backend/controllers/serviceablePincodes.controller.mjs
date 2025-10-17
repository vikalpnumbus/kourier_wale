import ServiceablePincodesService from "../services/serviceablePincodes.service.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    if (req?.user?.role != "admin") {
      const error = new Error("You don't have access to perform this action.");
      error.status = 401;
      throw error;
    }
    const result = await ServiceablePincodesService.create({
      data: {
        ...req.body,
      },
    });
    if (!result) {
      console.error(ServiceablePincodesService.error);
      throw ServiceablePincodesService.error;
    }
    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      id: req.params.id || undefined,
    };

    const result = await ServiceablePincodesService.read(query);
    if (!result) {
      throw ServiceablePincodesService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Record id is required.");
      error.status = 400;
      throw error;
    }

    const existingRecord = await ServiceablePincodesService.read({
      id: id,
    });

    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const payload = {
      id: id,
      ...req.body,
    };

    const result = await ServiceablePincodesService.update({
      data: payload,
    });
    if (!result) {
      throw ServiceablePincodesService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const query = {};
    if (req.params.id) {
      query.id = req.params.id;
    }
    const result = await ServiceablePincodesService.remove(query);
    if (!result) {
      throw ServiceablePincodesService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const bulkImport = async (req, res, next) => {
  try {
    if (!req.files || req.files?.length != 1) {
      const error = new Error(
        "File Required and only 1 .csv file allowed to be uploaded."
      );
      error.status = 400;
      throw error;
    }

    let rows = await readCsvAsArray(Buffer.from(req.files[0].buffer));

    if (!rows || rows.length == 0) {
      const error = new Error(
        "Empty file is not accepatable.Add some data before proceeding."
      );
      error.status = 400;
      throw error;
    }

    const headers = Object.keys(rows[0]);
    const allowedHeaders = [
      "Delivery pincode serviceable for SWA",
      "Node",
      "State ",
      "City",
      "Holiday and Contingency events ",
      "Start Date",
      "End Date",
    ].sort();

    const missing = allowedHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      const error = new Error(
        `Missing required headers: ${missing.join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const invalid = headers.filter((h) => !allowedHeaders.includes(h));
    if (invalid.length > 0) {
      const error = new Error(`Invalid headers found: ${invalid.join(", ")}`);
      error.status = 400;
      throw error;
    }


    const result = await ServiceablePincodesService.bulkImport({
      files: req.files,
      data: { userId: req.user.id },
    });
    if (!result) {
      throw ServiceablePincodesService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
