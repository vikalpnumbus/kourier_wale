import sqlDB from "../configurations/sql.config.mjs";
import { formatDate_YYYY_MM_DD, withCache } from "../utils/basic.utils.mjs";

class Service {
  constructor() {
    this.error = null;
  }

  async dashboardStats(params) {
    try {
      const { start_date = "2025-08-01", end_date = formatDate_YYYY_MM_DD(Date.now()), userId } = params;
      const key = `dashboard:${userId}:dashboardStats:${start_date}:${end_date}`;

      const query = `SELECT sum(case when (shipping.shipping_status = 'delivered') then 1 else 0 end) as delivered, sum(case when (shipping.shipping_status = 'delivered' and orders.paymentType!='reverse') then orders.orderAmount else 0 end) as revenue, sum(case when (shipping.shipping_status = 'rto') then 1 else 0 end) as rto, sum(case when (shipping.shipping_status in ('in transit', 'out for delivery', 'delivered', 'exception', 'rto' ,'picked','rad')) then 1 else 0 end) as total_delivered_shipments, sum(1) as total_shipments, sum(case when (orders.paymentType = 'COD') then 1 else 0 end) as cod_shipments, sum(case when (orders.paymentType = 'Prepaid') then 1 else 0 end) as prepaid_shipments FROM shipping LEFT JOIN orders ON orders.id = shipping.order_db_id WHERE shipping.createdAt >= :start_date AND shipping.shipping_status != 'cancelled' AND shipping.createdAt <= :end_date AND shipping.userId = :userId`;

      const result = await withCache({
        key,
        ttl: 600,
        fetcher: async () => {
          const [result] = await sqlDB.sequelize.query(query, {
            replacements: { start_date, end_date, userId },
          });
          return result;
        },
      });

      return { data: result };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async courierWiseStats(params) {
    try {
      const { start_date = "2025-08-01", end_date = formatDate_YYYY_MM_DD(Date.now()), userId } = params;
      const key = `dashboard:${userId}:courierWiseStats:${start_date}:${end_date}`;

      const query = `
        SELECT 
          courier.id AS courier_id,
          courier.name AS courier_name,
          SUM(CASE WHEN shipping.shipping_status = 'booked' THEN 1 ELSE 0 END) AS booked,
          SUM(CASE WHEN shipping.shipping_status = 'pending_pickup' THEN 1 ELSE 0 END) AS pending_pickup,
          SUM(CASE WHEN shipping.shipping_status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
          SUM(CASE WHEN shipping.shipping_status = 'rto' THEN 1 ELSE 0 END) AS rto_count,
          SUM(CASE WHEN shipping.shipping_status = 'in_transit' THEN 1 ELSE 0 END) AS in_transit_count
        FROM shipping INNER JOIN courier
        ON shipping.courier_id = courier.id
        WHERE shipping.createdAt>= :start_date AND shipping.createdAt<= :end_date AND shipping.userId = :userId GROUP BY courier.id, courier.name;
       `;

      const result = await withCache({
        key,
        ttl: 600,
        fetcher: async () => {
          const [result] = await sqlDB.sequelize.query(query, {
            replacements: { start_date, end_date, userId },
          });
          return result;
        },
      });

      return { data: result };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async paymentModeWiseStats(params) {
    try {
      const { start_date = "2025-08-01", end_date = formatDate_YYYY_MM_DD(Date.now()), userId } = params;
      const key = `dashboard:${userId}:paymentModeWiseStats:${start_date}:${end_date}`;

      const query = `
       SELECT
       SUM(CASE WHEN shipping.paymentType = 'cod' or shipping.paymentType = 'COD'  THEN 1 ELSE 0 END ) as cod_payments,
       SUM(CASE WHEN shipping.paymentType = 'prepaid' or shipping.paymentType = 'Prepaid' THEN 1 ELSE 0 END ) as  prepaid_payments
       FROM shipping
       WHERE shipping.createdAt>= :start_date AND shipping.createdAt<= :end_date AND shipping.userId = :userId;
       `;

      const result = await withCache({
        key,
        ttl: 600,
        fetcher: async () => {
          const [result] = await sqlDB.sequelize.query(query, {
            replacements: { start_date, end_date, userId },
          });
          return result;
        },
      });

      return { data: result };
    } catch (error) {
      this.error = error;
      return false;
    }
  }

  async cityWiseStats(params) {
    try {
      const { start_date = "2025-08-01", end_date = formatDate_YYYY_MM_DD(Date.now()), userId } = params;
      const key = `dashboard:${userId}:cityWiseStats:${start_date}:${end_date}`;

      const query = `
       SELECT
       JSON_UNQUOTE(JSON_EXTRACT(shippingDetails, '$.city')) AS city,
       COUNT(*) AS shipment_count
       FROM shipping
       WHERE shipping.createdAt>= :start_date AND shipping.createdAt<= :end_date AND shipping.userId = :userId
       GROUP BY city
       ORDER BY shipment_count DESC
       LIMIT 10;
       `;

      const result = await withCache({
        key,
        ttl: 600,
        fetcher: async () => {
          const [result] = await sqlDB.sequelize.query(query, {
            replacements: { start_date, end_date, userId },
          });
          return result;
        },
      });

      return { data: result };
    } catch (error) {
      console.log("error: ", error);
      this.error = error;
      return false;
    }
  }

  async productWiseStats(params) {
    try {
      const { start_date = "2025-08-01", end_date = formatDate_YYYY_MM_DD(Date.now()), userId } = params;
      const key = `dashboard:${userId}:productWiseStats:${start_date}:${end_date}`;

      const query = `
        SELECT
          p.id   AS product_id,
          p.name AS product_name,
          p.sku  AS product_sku,
      
          COUNT(*) AS total_shipments,
      
          SUM(s.shipping_status = 'new')       AS new_count,
          SUM(s.shipping_status = 'booked') AS booked_count,
          SUM(s.shipping_status = 'pending_pickup') AS pending_pickup_count,
          SUM(s.shipping_status = 'in_transit') AS in_transit_count,
          SUM(s.shipping_status = 'delivered') AS delivered_count,
          SUM(s.shipping_status = 'rto')    AS rto_count
      
        FROM shipping s
        JOIN JSON_TABLE(
          s.products,
          '$[*]' COLUMNS (
            id   VARCHAR(50)  PATH '$.id',
            name VARCHAR(255) PATH '$.name',
            sku  VARCHAR(255) PATH '$.sku'
          )
        ) p
        WHERE s.createdAt>= :start_date AND s.createdAt<= :end_date AND s.userId = 4
        GROUP BY p.id, p.name, p.sku
        LIMIT 10;
       `;

      const result = await withCache({
        key,
        ttl: 600,
        fetcher: async () => {
          const [result] = await sqlDB.sequelize.query(query, {
            replacements: { start_date, end_date, userId },
          });
          return result;
        },
      });

      return { data: result };
    } catch (error) {
      console.log("error: ", error);
      this.error = error;
      return false;
    }
  }
}

const DashboardService = new Service();
export default DashboardService;
