import { col, fn, literal, Op, where } from "sequelize";
import OrdersProducer from "../queue/producers/orders.producer.mjs";
import FactoryRepository from "../repositories/factory.repository.mjs";
import ProductsService from "./products.service.mjs";
import WarehouseService from "./warehouse.service.mjs";

class Service {
  constructor() {
    this.error = null;
    this.repository = FactoryRepository.getRepository("orders");
  }

  async create({ data }) {
    try {
      let { warehouse_id, products } = data;
      let productIDs = products.map((e) => e.id).join(",");
      productIDs = productIDs
        .split(",")
        .map((e) => e?.trim())
        .filter((e) => e && e !== "null" && e !== "undefined" && e != "false");

      const foundProducts = await ProductsService.read({
        id: productIDs,
      });

      const checkProductExistence = new Set(
        foundProducts?.data?.result?.map((e) => e.id + "")
      );

      const missingIds = productIDs.filter(
        (id) => !checkProductExistence.has(id)
      );

      if (missingIds.length > 0) {
        const error = new Error(
          `Product with IDs ${missingIds.join(", ")} does not exist.`
        );
        error.status = 422;
        throw error;
      }

      const foundWarehouses = await WarehouseService.read({
        id: warehouse_id,
      });
      if (!foundWarehouses) {
        const error = new Error("Warehouse with given ID does not found.");
        error.status = 400;
        throw error;
      }

      const checkWarehouseExistence = new Set(
        foundWarehouses?.data?.result?.map((e) => e.id + "")
      );

      const missingWarehouseIds = !checkWarehouseExistence.has(warehouse_id)
        ? [warehouse_id]
        : [];

      if (missingWarehouseIds.length > 0) {
        const error = new Error(
          `Warehouse with IDs ${missingWarehouseIds.join(", ")} does not exist.`
        );
        error.status = 422;
        throw error;
      }

      const payload = { ...data, products };
      const result = await this.repository.save(payload);

      return {
        status: 201,
        data: {
          message: "Order has been created successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async update({ data }) {
    try {
      const existingRecordId = data.id;

      delete data.id;

      let payload = { ...data };

      if (data.productIDs) {
        let { productIDs } = data;

        productIDs = productIDs
          .split(",")
          .map((e) => e?.trim())
          .filter(
            (e) => e && e !== "null" && e !== "undefined" && e != "false"
          );

        const foundProducts = await ProductsService.read({
          id: productIDs,
        });

        const checkProductExistence = new Set(
          foundProducts?.data?.result?.map((e) => e.id + "")
        );

        const missingIds = productIDs.filter(
          (id) => !checkProductExistence.has(id)
        );

        if (missingIds.length > 0) {
          const error = new Error(
            `Product with IDs ${missingIds.join(", ")} does not exist.`
          );
          error.status = 422;
          throw error;
        }

        payload = { ...payload, productIDs: productIDs.join(", ") };
      }
      const result = await this.repository.findOneAndUpdate(
        { id: existingRecordId },
        payload
      );

      return {
        status: 201,
        data: {
          message: "Order has been updated successfully.",
          id: result.id,
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async read(params) {
    try {
      const {
        userId,
        page = 1,
        limit = 50,
        id,
        orderId,
        shipping_name,
        shipping_phone,
        shipping_status,
        warehouse_id,
        paymentType,
        start_date,
        end_date,
      } = params;

      const whereClause = { [Op.and]: [] };

      // Direct equality filters
      if (userId) whereClause[Op.and].push({ userId });
      if (id) whereClause[Op.and].push({ id });
      if (shipping_status) whereClause[Op.and].push({ shipping_status });
      if (warehouse_id) whereClause[Op.and].push({ warehouse_id });
      if (paymentType) whereClause[Op.and].push({ paymentType });

      if (orderId) {
        const orderIdsArray = Array.isArray(orderId)
          ? orderId
          : orderId?.split(",").map((e) => e.trim());
        whereClause[Op.and].push({
          orderId: { [Op.in]: orderIdsArray },
        });
      }

      // Shipping name (JSON concat)
      if (shipping_name) {
        whereClause[Op.and].push(
          where(
            fn(
              "CONCAT",
              fn(
                "COALESCE",
                fn(
                  "JSON_UNQUOTE",
                  fn(
                    "JSON_EXTRACT",
                    col("shippingDetails"),
                    literal("'$.fname'")
                  )
                ),
                ""
              ),
              " ",
              fn(
                "COALESCE",
                fn(
                  "JSON_UNQUOTE",
                  fn(
                    "JSON_EXTRACT",
                    col("shippingDetails"),
                    literal("'$.lname'")
                  )
                ),
                ""
              )
            ),
            { [Op.like]: `%${shipping_name}%` }
          )
        );
      }

      // Shipping phone (JSON phone / alternate_phone)
      if (shipping_phone) {
        whereClause[Op.and].push({
          [Op.or]: [
            where(
              fn(
                "JSON_UNQUOTE",
                fn("JSON_EXTRACT", col("shippingDetails"), literal("'$.phone'"))
              ),
              { [Op.like]: `%${shipping_phone}%` }
            ),
            where(
              fn(
                "JSON_UNQUOTE",
                fn(
                  "JSON_EXTRACT",
                  col("shippingDetails"),
                  literal("'$.alternate_phone'")
                )
              ),
              { [Op.like]: `%${shipping_phone}%` }
            ),
          ],
        });
      }

      // Date filters (ignore time)
      if (start_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.gte]: start_date })
        );
      }
      if (end_date) {
        whereClause[Op.and].push(
          where(fn("DATE", col("createdAt")), { [Op.lte]: end_date })
        );
      }

      // If no conditions were added, remove Op.and
      if (!whereClause[Op.and].length) delete whereClause[Op.and];

      let result;
      let totalCount;

      if (id) {
        result = await this.repository.find(whereClause);
        if (result.length == 0) {
          const error = new Error("No record found.");
          error.status = 404;
          throw error;
        }
        totalCount = result.length;
      } else {
        result = await this.repository.find(whereClause, { page, limit });
        totalCount = await this.repository.countDocuments(whereClause);

        if (!result || result.length === 0) {
          result = [];
        }
      }

      // fill products in each order record
      result = await Promise.all(
        result.map(async (e) => {
          // ✅ make sure e.products is always an array
          const productsArray = Array.isArray(e.products) ? e.products : [];

          // ✅ get product IDs
          let productIDs = productsArray.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((id) => id?.trim())
            .filter(
              (id) => id && id !== "null" && id !== "undefined" && id !== "false"
            );

          // ✅ fetch product details
          let foundProducts = [];
          if (productIDs.length > 0) {
            foundProducts = (await ProductsService.read({ id: productIDs })).data
              .result;

            foundProducts = foundProducts.map((product) => ({
              ...product.dataValues,
              ...productsArray.find((curr) => curr.id == product.id),
            }));
          }

          // ✅ JSON safe parser
          const safeParse = (data) => {
            try {
              if (!data) return {};
              return typeof data === "string" ? JSON.parse(data) : data;
            } catch (err) {
              console.warn("Invalid JSON field:", err, data);
              return {};
            }
          };

          // ✅ parse JSON fields

          const shippingDetails = safeParse(e.dataValues.shippingDetails);
          const packageDetails = safeParse(e.dataValues.packageDetails);
          const paymentDetails = safeParse(e.dataValues.paymentDetails);

          // ✅ construct payload
          const payload = {
            ...e.dataValues,
            products: foundProducts,
            shippingDetails: {
              phone: shippingDetails.phone || "",
              fname: shippingDetails.fname || "",
              lname: shippingDetails.lname || "",
              address: shippingDetails.address || "",
              city: shippingDetails.city || "",
              state: shippingDetails.state || "",
              country: shippingDetails.country || "",
              pincode: shippingDetails.pincode || "",
            },
            packageDetails: {
              weight: packageDetails.weight || "",
              length: packageDetails.length || "",
              height: packageDetails.height || "",
              breadth: packageDetails.breadth || "",
              volumetricWeight: packageDetails.volumetricWeight || 0,
            },
            paymentDetails: {
              shipping: paymentDetails.shipping || 0,
              tax_amount: paymentDetails.tax_amount || 0,
              cod: paymentDetails.cod || 0,
              discount: paymentDetails.discount || 0,
            },
          };

          delete payload.productIDs;
          return payload;
        })
      );
      return { data: { total: totalCount, result } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async remove(params) {
    try {
      const result = await this.repository.findOneAndDelete(params);

      if (!result) {
        const error = new Error("No record found.");
        error.status = 404;
        throw error;
      }

      return { data: { message: "Deleted successfully." } };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async bulkImport({ files, data }) {
    try {
      const { userId } = data;
      if (!files) {
        const error = new Error("No file found.");
        error.status = 400;
        throw error;
      }

      OrdersProducer.publishImportFile({
        files: files.map((e) => ({
          fileName: userId,
          file: e,
          dir: "orders",
        })),
        metadata: {
          id: userId,
        },
      });

      return {
        status: 200,
        data: {
          message: "Importing the orders.",
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async bulkExport(params) {
    try {
      const { page = 1, limit = 50, id, search, ...filters } = params;

      // Build where condition
      let where = { ...filters };

      if (id) {
        where.id = id;
      }

      if (search) {
        where[Op.or] = [
          { orderId: { [Op.like]: `%${search}%` } }, // MySQL LIKE (case-insensitive if collation allows)
        ];
      }

      let result;
      let totalCount;
      result = await this.repository.find(where, { page, limit });
      totalCount = await this.repository.countDocuments(where);

      if (!result || result.length === 0) {
        const error = new Error("No records found.");
        error.status = 404;
        throw error;
      }

      //fill products in each order record
      result = await Promise.all(
        result.map(async (e) => {
          let productIDs = e.products.map((product) => product.id).join(",");
          productIDs = productIDs
            .split(",")
            .map((e) => e?.trim())
            .filter(
              (e) => e && e !== "null" && e !== "undefined" && e != "false"
            );

          const foundProducts = (
            await ProductsService.read({
              id: productIDs,
            })
          ).data.result;

          const payload = { ...e.dataValues, products: foundProducts };
          delete payload.productIDs;
          return payload;
        })
      );
      return {
        data: {
          total: totalCount,
          result: result.map((e) => ({
            id: e.id,
            "Order ID": e.orderId,
            "Order Date": new Date(e.createdAt),
            "Payment Type": e.paymentType,
            "Channel Name": "Manual",
            "Warehouse ID": e.warehouse_id,
            "Warehouse Name": null,
            "Warehouse No": null,
            "Warehouse Address": null,
            "Warehouse Pincode": null,
            "Warehouse City": null,
            "Warehouse State": null,
            "Customer Name":
              e["shippingDetails"].fname + " " + e["shippingDetails"].lname,
            "Customer Email": e["shippingDetails"].email || null,
            "Customer Address": e["shippingDetails"].address || null,
            "Customer Pincode": e["shippingDetails"].pincode || null,
            "Customer City": e["shippingDetails"].city || null,
            "Customer State": e["shippingDetails"].state || null,
            "Product Weight": e.packageDetails.weight || null,
            "Product LBH":
              e.packageDetails.length +
              " X " +
              e.packageDetails.breadth +
              " X " +
              e.packageDetails.height,
            "Shipping Charges (By Seller)": e.charges.shipping || null,
            "Shipping TAX (By Seller)": e.charges.tax_amount || null,
            "COD Charge (By Seller)": e.charges.cod || null,
            "Shipping Discount (By Seller)": e.charges.discount || null,
            "Collectable Amount": e.collectableAmount || null,
            "Product Total Amount": null,
            "Orders Product section": e.products,
          })),
        },
      };
    } catch (error) {
      this.error = error;
      return false;
    }
  }
}

const OrdersService = new Service();
export default OrdersService;
