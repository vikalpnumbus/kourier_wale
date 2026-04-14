import ShippingProducer from "../queue/producers/shipping.producer.mjs";
import ShippingService from "../services/shipping.service.mjs";
import sqlDB from "../configurations/sql.config.mjs";
import ShippingModel from "../model/shipping.sql.model.mjs";
import OrderStatusLog from "../model/orderStatusLog.model.mjs";


export const create = async (req, res, next) => {
  try {
    const {
      order_db_ids,
      warehouse_id,
      rto_warehouse_id,
      courier_id,
      freight_charge,
      cod_price,
      zone,
      plan_id,
    } = req.body;
    if (order_db_ids.length == 1) {
      const result = await ShippingService.create({
        data: {
          userId: req.user.id,
          order_id: order_db_ids[0],
          warehouse_id,
          rto_warehouse_id,
          courier_id,
          freight_charge,
          cod_price,
          zone,
          plan_id,
        },
      });
      if (!result) {
        throw ShippingService.error;
      }
      res.success(result);
    } else {
      ShippingProducer.publishData({
        order_db_ids,
        warehouse_id,
        rto_warehouse_id,
        courier_id,
        freight_charge,
        cod_price,
        zone,
        plan_id,
        userId: req.user.id,
      });

      res.success({ data: "Creating Shipments." });
    }
  } catch (error) {
    console.error('error: ', error);
    next({ status: error.status, message: error.details || error.message });
  }
};

export const read = async (req, res, next) => {
  try {
    const query = {
      userId: req.user.id,
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

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      const error = new Error("Record id is required.");
      error.status = 400;
      throw error;
    }

    const existingRecord = await ShippingService.read({
      userId: req.user.id,
      id: id,
    });
    if (!existingRecord) {
      const error = new Error("No record found.");
      error.status = 404;
      throw error;
    }

    const payload = {
      userId: req.user.id,
      id: id,
      ...req.body,
    };

    const result = await ShippingService.update({
      data: payload,
    });
    if (!result) {
      throw ShippingService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const query = { userId: req.user.id };
    if (req.params.id) {
      query.id = req.params.id;
    }
    const result = await ShippingService.remove(query);
    if (!result) {
      throw ShippingService.error;
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const shippingChargesRead = async (req, res, next) => {
  try {
    const query = {
      userId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      id: req.params.id || undefined,
      orderId: req.query?.orderId || undefined,
      shipping_name: req.query?.shipping_name || undefined,
      shipping_phone: req.query?.shipping_phone || undefined,
      warehouse_id: req.query?.warehouse_id || undefined,
      paymentType: req.query?.paymentType || undefined,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      courier_id:req.query?.courier_id,
      exclude_shipping_status:'new'
    };

    const result = await ShippingService.read(query);
    if (!result) {
      throw ShippingService.error;
    }
    result.data.result = result.data.result.map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      courier_id: e.courier_id,
      courier_name:e.courier_name,
      awb_number: e.awb_number,
      shipping_status: e.shipping_status,
      zone: e.zone,
      freight_charge: e.freight_charge,
      cod_price: e.cod_price,
      entered_weight: Math.max(
        Number(e.packageDetails.weight),
        Number(e.packageDetails.volumetricWeight)
      ),
      applied_weight: 0,
      extra_weight_charges: 0,
      rto_charges: 0,
      cod_charge_reversed: 0,
      rto_extra_weight_charges: 0,
      shipment_insurance_charges: 0,
      total_charges: 0,
    }));

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const handleCancelShipment = async (req, res, next) => {
  try {
    const { shipment_ids } = req.body;

    if (shipment_ids.length == 1) {
      const result = await ShippingService.handleCancelSingleShipment({
        data: { id: shipment_ids[0], userId: req.user.id },
      });
      if (!result) {
        throw ShippingService.error;
      }
      return res.success(result);
    } else {
      ShippingProducer.publishShipmentCancelData({
        shipment_ids,
        userId: req.user.id,
      });

      res.success({ data: "Cancelling Shipments." });
    }
  } catch (error) {
    next(error);
  }
};

export const generatePickup = async (req, res, next) => {
  const t = await sqlDB.sequelize.transaction();
  try {
    const { shipment_ids } = req.body;
    const userId = req.user.id;
    const shipments = await ShippingModel.findAll({
      where: { id: shipment_ids, userId },
      transaction: t,
    });
    if (!shipments.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "No valid shipments found",
      });
    }
    const validShipments = shipments.filter(
      (s) => s.shipping_status === "booked"
    );
    await ShippingModel.update(
      { shipping_status: "pending_pickup" },
      {
        where: {
          id: shipment_ids,
          userId,
          shipping_status: "booked",
        },
        transaction: t,
      }
    );
    const logs = shipments.map((s) => ({
      shipment_id: s.id,
      user_id: userId,
      awb_number: s.awb_number,
      courier_name: s.courier_name,
      ship_status: "pending_pickup",
      raw_payload: null,
    }));
    if (logs.length) {
      await OrderStatusLog.bulkCreate(logs, { transaction: t });
    }
    await t.commit();
    return res.success({
      message: "Pickup generated successfully",
    });
  } catch (error) {
    await t.rollback();
    console.error("Generate Pickup Error:", error);
    next(error);
  }
};