import InvoiceSettingsService from "../services/invoiceSettings.services.mjs";

export const create = async (req, res, next) => {
  try {
    const result = await InvoiceSettingsService.create({ ...req.body, userId: req.user.id });
    if (!result) throw InvoiceSettingsService.error;
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  try {
    const result = await InvoiceSettingsService.read({ userId: req.user.id });
    if (!result) throw InvoiceSettingsService.error;
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await InvoiceSettingsService.update({ userId: req.user.id, ...req.body });
    if (!result) throw InvoiceSettingsService.error;
    res.success(result);
  } catch (error) {
    next(error);
  }
};
export const generate = async (req, res, next) => {
  try {
    const result = await InvoiceSettingsService.generate({ userId: req.user.id, ...req.body });
    if (!result) throw InvoiceSettingsService.error;
    console.log('result: ', result);
    res.setHeader('Content-Type', 'application/pdf'); 
    // res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}.pdf`);
    res.send(result.pdfBuffer)
    // res.success({data:result});
  } catch (error) {
    next(error);
  }
};
