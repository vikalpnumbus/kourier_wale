import OrdersService from "../services/orders.service.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    const result = await OrdersService.create({
      data: {
        userId: req.user.id,
        ...req.body,
      },
    });
    if (!result) {
      throw OrdersService.error;
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
      id: req.params.id,
      orderId: req.query?.orderId,
      shipping_name: req.query?.shipping_name,
      shipping_phone: req.query?.shipping_phone,
      shipping_status: req.query?.shipping_status,
      warehouse_id: req.query?.warehouse_id,
      paymentType: req.query?.paymentType,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
    };
    const result = await OrdersService.read(query);
    if (!result) {
      throw OrdersService.error;
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

    const existingRecord = await OrdersService.read({
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

    const result = await OrdersService.update({
      data: payload,
    });
    if (!result) {
      throw OrdersService.error;
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
    const result = await OrdersService.remove(query);
    if (!result) {
      throw OrdersService.error;
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
      "orderId",
      "orderAmount",
      "collectableAmount",
      "paymentType",
      "shippingDetails.phone",
      "shippingDetails.fname",
      "shippingDetails.lname",
      "shippingDetails.pincode",
      "shippingDetails.address",
      "shippingDetails.city",
      "shippingDetails.state",
      "shippingDetails.country",
      "packageDetails.weight",
      "packageDetails.length",
      "packageDetails.height",
      "packageDetails.breadth",
      "charges.shipping",
      "charges.tax_amount",
      "charges.cod",
      "charges.discount",
      "warehouse_id",
      "rto_warehouse_id",
      "Product 1 ID",
      "Product 1 Qty",
    ].sort();

    const productHeaderRegex = /^Product \d+ (ID|Qty)$/;

    const missing = allowedHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      const error = new Error(
        `Missing required headers: ${missing.join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const invalid = headers.filter(
      (h) => !allowedHeaders.includes(h) && !productHeaderRegex.test(h)
    );
    if (invalid.length > 0) {
      const error = new Error(`Invalid headers found: ${invalid.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const result = await OrdersService.bulkImport({
      files: req.files,
      data: { userId: req.user.id },
    });
    if (!result) {
      throw OrdersService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const bulkExport = async (req, res, next) => {
  try {
    const query = {
      userId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      id: req.query.id || undefined,
    };

    const result = await OrdersService.bulkExport(query);
    if (!result) {
      throw OrdersService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};
