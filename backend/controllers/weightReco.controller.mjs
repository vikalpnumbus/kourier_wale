import WeightRecoService from "../services/weightReco.service.mjs";


export const read = async (req, res, next) => {
  try {
    const query = {
      page: req.query?.page,
      limit: req.query?.limit,
      id: req.params?.id,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      userId: req.user.id,
      awb_number:req.query.awb_number,
      product_name:req.query.product_name,
      courier
    };

    const result = await WeightRecoService.read(query);
    if (!result) {
      throw WeightRecoService.error;
    }

    res.success(result);
  } catch (error) {
    console.error("[weightReco.controller.mjs/read]: error", error);
    next(error);
  }
};
