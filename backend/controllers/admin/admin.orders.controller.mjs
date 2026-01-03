import OrdersService from "../../services/admin/admin.orders.service.mjs";

export const read = async (req, res, next) => {
  try {
    const {
      channel_name,
      userId,
      page,
      limit,
      orderId,
      shipping_name,
      shipping_phone,
      shipping_status,
      warehouse_id,
      paymentType,
      start_date,
      end_date,
    } = req.query;
    const query = {
      userId,
      page,
      limit,
      id: req.params.id,
      orderId,
      shipping_name,
      shipping_phone,
      shipping_status,
      warehouse_id,
      paymentType,
      start_date,
      end_date,
      channel_name,
    };
    const result = await OrdersService.read(query);
    if (!result) {
      throw OrdersService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};
