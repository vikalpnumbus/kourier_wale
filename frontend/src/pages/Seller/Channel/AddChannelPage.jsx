import React from "react";
import { useNavigate } from "react-router-dom";

function AddChannelPage() {
    const navigate = useNavigate()
  return (
    <>
      <div className="row">
        <div className="col-md-3 col-lg-3 col-sm-12 col-xs-12">
          <div className="card card-rounded  bg-light text-center">
            <div className="card-body ">
              <h4 className="card-title card-title-dash  mb-2">Shopify</h4>

              <div>
                <button onClick={()=> navigate("shopify")} className="btn btn-dark btn-sm mt-2">Integrate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddChannelPage;
