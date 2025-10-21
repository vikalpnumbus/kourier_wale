import CourierService from "../services/courier.service.mjs";
import UserService from "../services/user.service.mjs";
import UserCourierService from "../services/userCourier.service.mjs";

export const save1 = async (req, res, next) => {
  try {
    const result = await UserService.save1(req.body);
    if (!result) {
      throw UserService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const save2 = async (req, res, next) => {
  try {
    const result = await UserService.save2(req.body);

    if (!result) {
      throw UserService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const result = await UserService.resendOTP(req.body);

    if (!result) {
      throw UserService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await UserService.login(req.body);
    if (!result) {
      throw UserService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await UserService.forgotPassword(req);
    if (!result) {
      throw UserService.error;
    }

    res.success({
      data: {
        resetLink: result,
        message: "The reset link has been sent to your registered email.",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await UserService.resetPassword(req.params, req.body);
    if (!result) {
      throw UserService.error;
    }

    res.success({
      data: { message: "Password Updated Successfully." },
    });
  } catch (error) {
    next(error);
  }
};

export const handleTokenCallback = async (req, res, next) => {
  try {
    const result = await UserService.handleTokenCallback(req.query);
    if (!result) {
      throw UserService.error;
    }

    res.success({
      data: { token: result },
    });
  } catch (error) {
    next(error);
  }
};

export const userList = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { id } = req.params;
    const query = {
      page,
      limit,
    };

    if (id) query.id = id;

    const userList = await UserService.readList(query);
    if (!userList) throw UserService.error;

    res.success(userList);
  } catch (error) {
    next(error);
  }
};
