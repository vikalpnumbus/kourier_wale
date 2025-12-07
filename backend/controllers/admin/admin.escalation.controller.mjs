import EscalationService from "../../services/admin/admin.escalation.service.mjs";
import ImageService from "../../services/image.service.mjs";
import UserService from "../../services/user.service.mjs";

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
      userId: req.query?.userId,
      assigneeId: req.user.id,
    };

    const user = await UserService.read({ id: req.user.id });
    if (["rahul.singh@nimbuspost.com", 'adminkourier@gamil.com'].includes(user.email)) {
      delete query.assigneeId;
    }

    console.log('query: ', query);
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

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Record id is required.");
      error.status = 400;
      throw error;
    }

    const existingRecord = await EscalationService.read({
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

    const result = await EscalationService.update({
      data: payload,
    });
    if (!result) {
      throw EscalationService.error;
    }
    res.success(result);
  } catch (error) {
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
