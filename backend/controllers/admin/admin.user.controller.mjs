import UserService from "../../services/admin/admin.user.service.mjs";

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
    };

    const userList = await UserService.read(query);
    if (!userList) throw UserService.error;

    res.success(userList);
  } catch (error) {
    next(error);
  }
};
