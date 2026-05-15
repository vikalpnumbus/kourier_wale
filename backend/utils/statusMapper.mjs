export const mapTrackingStatus = (provider, status, extra = {}) => {
  const s = status?.toLowerCase()?.trim();

  const mappings = {
    xpressbees: {
      // ✅ MAIN FLOW
      "pending pickup": "pending-pickup",
      "pp": "pending-pickup",
      "in transit": "in_transit",
      "it": "in_transit",
      "out for delivery": "out_for_delivery",
      "ofd": "out_for_delivery",
      "delivered": "delivered",
      "dl": "delivered",
      // ✅ EXCEPTION CASES
      "exception": "ndr",
      "ex": "ndr",
      "lost": "ndr",
      "lt": "ndr",
      "damaged": "ndr",
      "dg": "ndr",
      // ✅ RTO FLOW
      "rto": "rto",
      "rt": "rto",
      "rto in transit": "rto",
      "rt-it": "rto",
      "rto delivered": "rto",
      "rt-dl": "rto",
      "rto lost": "rto",
      "rt-lt": "rto",
      "rto damaged": "rto",
      "rt-dg": "rto",
    },
  };

  return mappings?.[provider]?.[s] ?? "in_transit";
};