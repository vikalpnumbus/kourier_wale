import ExportsService from "../../services/admin/admin.exports.service.mjs";

export const create = async (req, res, next) => {
  try {
    const { type, filters } = req.body;
    const { id: userId } = req.user;

    const result = await ExportsService.create({ userId, type, filters });

    if (!result) {
      throw ExportsService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const read = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, userId } = req.query;

    const result = await ExportsService.read({ id, page, limit, userId });
    if (!result) {
      throw ExportsService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
