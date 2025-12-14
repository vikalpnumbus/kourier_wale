import WeightRecoService from "../services/weightReco.service.mjs";
import { readCsvAsArray } from "../utils/basic.utils.mjs";

export const create = async (req, res, next) => {
  try {
    if (!req.files || req.files?.length != 1) {
      const error = new Error("File Required and only 1 .csv file allowed to be uploaded.");
      error.status = 400;
      throw error;
    }

    let rows = await readCsvAsArray(Buffer.from(req.files[0].buffer));
    
    if (!rows || rows.length == 0) {
      const error = new Error("Empty file is not accepatable.Add some data before proceeding.");
      error.status = 400;
      throw error;
    }

    const headers = Object.keys(rows[0]);
    const allowedHeaders = ["AWB Number", "Billed Weight", "Volumetric Weight", "Length", "Breadth", "Height", "Remarks", "Image Urls"].sort();

    const missing = allowedHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      const error = new Error(`Missing required headers: ${missing.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const invalid = headers.filter((h) => !allowedHeaders.includes(h));
    if (invalid.length > 0) {
      const error = new Error(`Invalid headers found: ${invalid.join(", ")}`);
      error.status = 400;
      throw error;
    }
    
    const result = await WeightRecoService.create({
      files: req.files,
      data: { userId: req.user.id },
    });
    if (!result) {
      throw WeightRecoService.error;
    }
    res.success(result);
  } catch (error) {
    console.error("[weightReco.controller.mjs/read]: error", error);
    next(error);
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query?.page,
      limit: req.query?.limit,
      id: req.params?.id,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      userId: req.user.id,
      awb_number: req.query.awb_number,
      product_name: req.query.product_name,
      courier: req.query.courier,
    };

    const result = await WeightRecoService.read(query);
    if (!result) {
      throw WeightRecoService.error;
    }

    res.success(result);
  } catch (error) {
    console.error("[weightReco.controller.mjs/read]: error", error);
    next(error);
  }
};
