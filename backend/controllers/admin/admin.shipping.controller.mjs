import ShippingService from "../../services/admin/admin.shipping.service.mjs";

export const read = async (req, res, next) => {
  try {
    const query = {
      userId: req.query.userId,
      page: req.query.page,
      limit: req.query.limit,
      id: req.params.id,
      orderId: req.query?.orderId,
      shipping_name: req.query?.shipping_name,
      shipping_phone: req.query?.shipping_phone,
      shipping_status: req.query?.shipping_status,
      warehouse_id: req.query?.warehouse_id,
      paymentType: req.query?.paymentType,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      awb_number: req.query?.awb_number,
      courier_id: req.query?.courier_id,
    };

    const result = await ShippingService.read(query);
    if (!result) {
      throw ShippingService.error;
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};