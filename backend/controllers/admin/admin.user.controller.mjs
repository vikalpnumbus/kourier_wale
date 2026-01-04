import UserService from "../../services/admin/admin.user.service.mjs";

export const update = async (req, res, next) => {
  try {
    const { isActive, seller_remit_cycle, pricingPlanId } = req.body;
    const { id } = req.params;

    const result = await UserService.update({ data: { isActive, seller_remit_cycle, pricingPlanId, id } });
    if (!result) throw UserService.error;

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const userList = async (req, res, next) => {
  try {
    const { page, limit, name, email, phone, isVerified, start_date, end_date, include, isActive, handlingAdmins, userId } = req.query;
    const query = {
      page,
      limit,
      id: req.params.id,
      name,
      email,
      phone,
      isVerified,
      start_date,
      end_date,
      include,
      isActive,
      handlingAdmins,
      userId,
    };

    const userList = await UserService.read(query);
    if (!userList) throw UserService.error;

    res.success(userList);
  } catch (error) {
    console.log("error: ", error);
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
