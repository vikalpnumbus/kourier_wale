import BankDetailsService from "../services/bankDetails.service.mjs";

export const create = async (req, res, next) => {
  try {
    const ifscDetails = await BankDetailsService.validateIfscDetails(req);

    if (!ifscDetails) {
      throw BankDetailsService.error;
    }

    const existingRecord = await BankDetailsService.read({
      userId: req.user.id,
      accountNumber: req.body.accountNumber,
    });
    if (existingRecord.length > 0) {
      const error = new Error("This bank account number already exists.");
      error.status = 409;
      throw error;
    }

    const files = req.files;
    let requiredFiles = ["cancelledChequeImage"];

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

    const result = await BankDetailsService.create({
      files: files
        .map((f) => (requiredFiles.includes(f.fieldname) ? f : null))
        .filter(Boolean),
      data: {
        userId: req.user.id,
        ...req.body,
        ifscDetails,
      },
    });
    if (!result) {
      throw BankDetailsService.error;
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
    };
    if (req.params.id) {
      query.id = req.params.id;
    }
    const result = await BankDetailsService.read(query);
    if (!result) {
      throw BankDetailsService.error;
    }
    res.success(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    if (!req.params.id) {
      const error = new Error("Bank Record id is required.");
      error.status = 400;
      throw error;
    }

    if (!req.body || Object.keys(req.body).length == 0) {
      const error = new Error("Request body cannot be empty.");
      error.status = 400;
      throw error;
    }

    const ifscDetails = await BankDetailsService.validateIfscDetails(req);

    if (!ifscDetails) {
      throw BankDetailsService.error;
    }

    const files = req.files || [];
    const requiredFields = [
      "accountHolderName",
      "accountNumber",
      "bankName",
      "bankBranch",
      "ifscCode",
      "accountType",
      "address",
      "state",
      "city",
    ];

    if (requiredFields.filter((e) => req.body[e]).length > 0) {
      let requiredFiles = [];
      if (!(Object.keys(req.body).length == 1 && req.body.isPrimary)) {
        requiredFiles.push("cancelledChequeImage");
      }

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
    }
    let existingRecord = (
      await BankDetailsService.read({
        userId: req.user.id,
        id: req.params.id,
      })
    )?.data?.result;

    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    if (existingRecord.status == "approved") {
      const error = new Error(
        "Bank Detail is verified. To update it, contact our support team."
      );
      error.status = 403;
      throw error;
    }

    const result = await BankDetailsService.update({
      files: files.filter(Boolean),
      data: {
        userId: req.user.id,
        id: existingRecord.id,
        ...req.body,
        ifscDetails,
        status: "pending",
      },
    });
    if (!result) {
      throw BankDetailsService.error;
    }
    res.success({
      status: result.status,
      data: result?.data?.message || "Record updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getBankDetails = async (req, res, next) => {
  try {
    if (!req.params.ifscCode) {
      const error = new Error("IFSC Code is required.");
      error.status = 400;
      throw error;
    }

    const result = await BankDetailsService.getBankDetails(req.params.ifscCode);
    if (!result) {
      throw BankDetailsService.error;
    }

    res.success({
      status: result.status || 200,
      data: {
        bankBranch: result?.BRANCH || null,
        bankName: result?.BANK || null,
        ifscCode: result?.IFSC || null,
        address: result?.ADDRESS || null,
        state: result?.STATE || null,
        city: result?.CITY || null,
      },
    });
  } catch (err) {
    let error = err;
    if (err.status == 404) {
      error = new Error("No record found for the given IFSC code.");
      error.status = err.status;
    }
    next(error);
  }
};
