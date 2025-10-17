import ProductsService from "../services/products.service.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    const existingRecord = await ProductsService.read({
      userId: req.user.id,
      name: req.body.name,
      category: req.body.category,
    });
    if (existingRecord && existingRecord.length > 0) {
      const error = new Error("This product already exists.");
      error.status = 409;
      throw error;
    }

    const files = req.files;

    let requiredFiles = ["productImage"];

    const uploadedFileNames = files.map((f) => f.fieldname);

    const missingFiles = requiredFiles.filter(
      (required) => !uploadedFileNames.includes(required)
    );

    if (missingFiles.length > 0) {
      const error = new Error(`Missing required files: ${missingFiles}`);
      error.status = 400;
      error.details = missingFiles.map((e) => ({
        field: e,
        message: e + " is required.",
      }));
      throw error;
    }

    const result = await ProductsService.create({
      files: files
        .map((f) => (requiredFiles.includes(f.fieldname) ? f : null))
        .filter(Boolean),
      data: {
        userId: req.user.id,
        ...req.body,
      },
    });
    if (!result) {
      throw ProductsService.error;
    }
    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      userId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      name: req.query.name,
      sku: req.query.sku,
      category: req.query.category,
      id: req.params.id || undefined,
    };

    const result = await ProductsService.read(query);
    if (!result) {
      throw ProductsService.error;
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

    const files = req.files || [];

    const existingRecord = await ProductsService.read({
      userId: req.user.id,
      id: id,
    });

    if (existingRecord.data.total == 0) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const result = await ProductsService.update({
      files: files.filter(Boolean),
      data: {
        userId: req.user.id,
        id: id,
        ...req.body,
      },
    });
    if (!result) {
      throw ProductsService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.params.id) {
      query.id = req.params.id;
    }
    const result = await ProductsService.remove(query);
    if (!result) {
      throw ProductsService.error;
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
    const allowedHeaders = ["name", "sku", "category", "price", "image"];

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

    const result = await ProductsService.bulkImport({
      files: req.files,
      data: { userId: req.user.id },
    });
    if (!result) {
      throw ProductsService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
