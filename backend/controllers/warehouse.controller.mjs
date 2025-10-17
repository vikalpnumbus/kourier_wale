import WarehouseService from "../services/warehouse.service.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    const {
      support_email,
      support_phone,
      hide_end_customer_contact_number,
      hide_warehouse_mobile_number,
      hide_warehouse_address,
      hide_product_details,
    } = req.body;

    const result = await WarehouseService.create({
      data: {
        userId: req.user.id,
        ...req.body,
        labelDetails: {
          support_email,
          support_phone,
          hide_end_customer_contact_number,
          hide_warehouse_mobile_number,
          hide_warehouse_address,
          hide_product_details,
        },
      },
    });
    if (!result) {
      throw WarehouseService.error;
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
      search: req.query.search,
      id: req.params.id || undefined,
    };

    const result = await WarehouseService.read(query);
    if (!result) {
      throw WarehouseService.error;
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

    const existingRecord = await WarehouseService.read({
      userId: req.user.id,
      id: id,
    });
    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const payload = {
      userId: req.user.id,
      id: id,
      ...req.body,
      labelDetails: {
        ...(existingRecord.data?.result[0]?.labelDetails || {}),
        ...req.body,
      },
    };

    if (req.body.isActive === false) {
      payload.isPrimary = false;
    }

    const result = await WarehouseService.update({
      data: payload,
    });
    if (!result) {
      throw WarehouseService.error;
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
    const result = await WarehouseService.remove(query);
    if (!result) {
      throw WarehouseService.error;
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
      "name",
      "contactName",
      "contactPhone",
      "address",
      "city",
      "state",
      "pincode",
      "support_email",
      "support_phone",
    ];

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

    const result = await WarehouseService.bulkImport({
      files: req.files,
      data: { userId: req.user.id },
    });
    if (!result) {
      throw WarehouseService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
