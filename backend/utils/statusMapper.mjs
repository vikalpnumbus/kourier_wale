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
  };
  return mappings?.[provider]?.[s] ?? "in_transit";
};