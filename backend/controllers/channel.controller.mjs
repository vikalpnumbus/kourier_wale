import ChannelService from "../services/channel.service.mjs";

export const create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await ChannelService.create({
      data: { userId, ...req.body },
    });
    console.warn("TODO: data encryption needs to be implemented.");
    if (!result) {
      throw ChannelService.error;
    }
    res.success(result);
  } catch (error) {
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      userId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      id: req.params.id || undefined,
    };

    const result = await ChannelService.read(query);
    if (!result) {
      throw ChannelService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!id) {
      const error = new Error("Record id is required.");
      error.status = 400;
      throw error;
    }

    const existingRecord = await ChannelService.read({
      id: id,
      userId,
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

    const result = await ChannelService.update({
      data: payload,
    });
    if (!result) {
      throw ChannelService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const query = {};
    const userId = req.user.id;
    if (req.params.id) {
      query.id = req.params.id;
    }
    if (userId) {
      query.userId = userId;
    }
    const result = await ChannelService.remove(query);
    if (!result) {
      throw ChannelService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const fetch = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { channel } = req.body;
    const result = await ChannelService.fetch({ userId, channel });
    if (!result) {
      throw ChannelService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};
