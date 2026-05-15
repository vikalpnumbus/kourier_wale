export const mapTrackingStatus = (provider, status) => {
  const s = status?.toLowerCase()?.trim();

  const mappings = {
    xpressbees: {
      "pending pickup": "booked",
      "booked": "booked",
      "in transit": "in_transit",
      "exception": "ndr",
      "out for delivery": "out_for_delivery",
      "ofd": "out_for_delivery",
      "delivered": "delivered",
      "lost": "ndr",
      "damaged": "ndr",
      "rto": "rto",
      "rto in transit": "rto",
      "rt-it": "rto",
      "rto delivered": "rto",
      "rt-dl": "rto",
      "rto lost": "rto",
      "rt-lt": "rto",
      "rto damaged": "rto",
      "rt-dg": "rto",
    },
    shiprocket: {
      // 📦 BOOKED / INITIAL
      "1": "booked",
      "2": "booked",
      "3": "booked",
      "4": "booked",
      "5": "booked",
      "19": "booked",
      "42": "booked",
      "52": "booked",
      "59": "booked",

      // 🚚 IN TRANSIT
      "6": "in_transit",
      "18": "in_transit",
      "22": "in_transit",
      "38": "in_transit",
      "39": "ndr",
      "48": "in_transit",
      "49": "in_transit",
      "50": "in_transit",
      "51": "in_transit",
      "54": "in_transit",
      "55": "in_transit",
      "56": "in_transit",
      "57": "in_transit",

      // 🚚 OUT FOR DELIVERY
      "17": "out_for_delivery",

      // ✅ DELIVERED
      "7": "delivered",
      "23": "delivered",
      "26": "delivered",

      // ❌ CANCELLED
      "8": "cancelled",
      "16": "cancelled",
      "44": "cancelled",
      "45": "cancelled",

      // 🔁 RTO FLOW
      "9": "rto",
      "10": "rto",
      "14": "rto",
      "40": "rto",
      "41": "rto",
      "46": "rto",

      // 🚨 NDR / EXCEPTION
      "20": "ndr",
      "21": "ndr",
      "47": "ndr",

      // ⚠️ LOST / DAMAGE
      "12": "ndr",
      "24": "ndr",
      "25": "ndr",

      // ⏳ PENDING
      "11": "booked",
      "13": "ndr",
      "15": "booked",
    },
  };
  return mappings?.[provider]?.[s] ?? "in_transit";
};