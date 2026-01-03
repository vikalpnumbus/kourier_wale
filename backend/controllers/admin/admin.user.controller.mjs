import UserService from "../../services/admin/admin.user.service.mjs";

export const update = async (req, res, next) => {
  try {
    const { isActive, seller_remit_cycle } = req.body;
    const { id } = req.params;

    const result = await UserService.update({ data: { isActive, seller_remit_cycle, id } });
    if (!result) throw UserService.error;

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const userList = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      id: req.params.id,
      name: req.query?.name,
      email: req.query?.email,
      phone: req.query?.phone,
      isVerified: req.query?.isVerified,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      include: req.query?.include,
      isActive: req.query?.isActive,
    };

    const userList = await UserService.read(query);
    if (!userList) throw UserService.error;

    res.success(userList);
  } catch (error) {
    next(error);
  }
};

export const adminUserHandling = async (req, res, next) => {
  try {
    const { adminId, userId } = req.body;

    const result = await UserService.adminUserHandling({ data: { adminId, userId } });
    if (!result) throw UserService.error;

    res.success(result);
  } catch (error) {
    next(error);
  }
};
