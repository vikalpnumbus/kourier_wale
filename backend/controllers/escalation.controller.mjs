import EscalationService from "../services/escalation.service.mjs";
import ImageService from "../services/image.service.mjs";

export const create = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { type, subject, query, awb_numbers } = req.body;
    const files = req.files;

    let paths = null;
    if (files) {
      const receivedFiles = files;
      paths = await Promise.all(
        receivedFiles.map((e) => {
          return ImageService.processImage({
            image: e,
            imageName: Date.now(),
            dir: `escalations/user_${userId}`,
          });
        })
      );
    }
    const result = await EscalationService.create({
      data: {
        type,
        subject,
        query,
        awb_numbers,
        userId,
        attachments: paths.map((e) => e.path.join(", "))?.join(", ") || null,
      },
    });
    if (!result) {
      throw EscalationService.error;
    }
    res.success(result);
  } catch (error) {
    console.error("[escalation.controller.mjs/create]: error", error);
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      id: req.params.id || undefined,
    };

    const result = await EscalationService.read(query);
    if (!result) {
      throw EscalationService.error;
    }

    res.success(result);
  } catch (error) {
    console.error("[escalation.controller.mjs/read]: error", error);
    next(error);
  }
};
