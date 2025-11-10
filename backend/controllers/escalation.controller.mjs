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
      page: req.query?.page,
      limit: req.query?.limit,
      id: req.params?.id,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      userId: req.user.id,
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

export const conversation_create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { escalation_id, to, message } = req.body;
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
    const result = await EscalationService.conversation_create({
      data: {
        escalation_id,
        from: userId,
        to,
        message,
        attachments: paths.map((e) => e.path.join(", "))?.join(", ") || null,
      },
    });
    if (!result) {
      throw EscalationService.error;
    }
    res.success(result);
  } catch (error) {
    console.error(
      "[escalation.controller.mjs/conversation_create]: error",
      error
    );
    next({ status: error.status, message: error.details || error.message });
  }
};

export const conversation_read = async (req, res, next) => {
  try {
    const query = {
      page: req.query?.page,
      limit: req.query?.limit,
      id: req.params?.id,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      escalation_id: req.query?.escalation_id,
    };

    const result = await EscalationService.conversation_read(query);
    if (!result) {
      throw EscalationService.error;
    }

    res.success(result);
  } catch (error) {
    console.error(
      "[escalation.controller.mjs/conversation_read]: error",
      error
    );
    next(error);
  }
};
