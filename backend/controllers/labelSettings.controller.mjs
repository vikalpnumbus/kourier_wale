import LabelSettingsService from "../services/labelSettings.services.mjs";

export const create = async (req, res, next) => {
  try {
    const { paper_size } = req.body;
    const result = await LabelSettingsService.create({
      data: {
        userId: req.user.id,
        paper_size,
      },
    });
    if (!result) throw LabelSettingsService.error;
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const generate = async (req, res, next) => {
  try {
    const { shipping_db_ids } = req.body;
    const result = await LabelSettingsService.generate({
      data: {
        userId: req.user.id,
        shipping_db_ids,
      },
    });

    if (!result) throw LabelSettingsService.error;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.fileName}.pdf"`,
    });
    res.send(result.pdfBuffer);
  } catch (error) {
    next(error);
  }
};
