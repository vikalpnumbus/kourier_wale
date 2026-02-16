import { useOutletContext } from "react-router-dom";
import OrdersTable from "./OrdersTable";

function OrdersListPage() {
  const { setExportHandler } = useOutletContext();

  return <OrdersTable setExportHandler={setExportHandler} />;
}

export default OrdersListPage;
