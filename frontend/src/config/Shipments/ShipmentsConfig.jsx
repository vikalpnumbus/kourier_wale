const apiUrl = import.meta.env.VITE_API_URL;
const shipmentsConfig = {
  createshipments: apiUrl + "/shipping",
  fetchshipmentlist: apiUrl + "/shipping",
  shipping_charges: apiUrl + "/shipping/shipping-charges",
  cancelshipment: apiUrl + "/shipping/cancelShipment",
  shipment_bulk_label: apiUrl + "/label-settings/generate"
};
export default shipmentsConfig;
