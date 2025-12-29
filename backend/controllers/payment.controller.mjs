import RazorPayProvider from "../providers/paymentGateways/razorpay/razorpay.provider.mjs";
import UserService from "../services/user.service.mjs";
import WalletHistoryService from "../services/wallet_history.service.mjs";

export const razorPayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await RazorPayProvider.order(amount);
    if (!result) throw RazorPayProvider.error;

    console.info("Payment initiated", {
      userId: req.user.id,
      result,
      time: new Date().toLocaleString(),
    });
    await WalletHistoryService.create({
      userId: req.user.id,
      event_type: "payment_initiated",
      amount,
      payment_type: "credit",
      logs: JSON.stringify(result, null, 2),
    });
    res.success(result);
  } catch (error) {
    console.error("Error of Payment initiated", {
      userId: req.user.id,
      time: new Date().toLocaleString(),
      error,
    });

    await WalletHistoryService.create({
      userId: req.user.id,
      event_type: "payment_initiated_error",
      amount,
      payment_type: "credit",
      logs: JSON.stringify(error, null, 2),
    });

    next({ status: error.status, message: error.details || error.message });
  }
};

export const razorPayVerify = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  try {
    const result = await RazorPayProvider.verify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    if (!result) throw RazorPayProvider.error;
    const amount = result?.data?.amount;

    console.info("Payment Done: ", {
      userId: req.user.id,
      result: JSON.stringify(result, null, 2),
      time: new Date().toLocaleString(),
    });

    await WalletHistoryService.create({
      userId: req.user.id,
      event_type: "payment_done",
      amount,
      payment_type: "credit",
      logs: JSON.stringify(result, null, 2),
    });

    const userWalletBalance = (await UserService.read({ id: req.user.id }))
      ?.wallet_balance;

    await UserService.update(
      { id: req.user.id },
      {
        wallet_balance: Number(userWalletBalance) + Number(amount),
      }
    );

    // await WalletHistoryService.create({
    //   userId: req.user.id,
    //   event_type: "payment_done",
    //   amount,
    //   payment_type: "credit",
    //   logs: JSON.stringify(
    //     {
    //       "userWalletBalance: previous ": Number(userWalletBalance),
    //       "userWalletBalance: after ":
    //         Number(userWalletBalance) + Number(amount),
    //     },
    //     null,
    //     2
    //   ),
    // });

    console.info("userWalletBalance: previous=> ", Number(userWalletBalance));
    console.info(
      "userWalletBalance: after=> ",
      Number(userWalletBalance) + Number(amount)
    );

    res.success(result);
  } catch (error) {
    console.error("Error of Payment Done: ", {
      userId: req.user.id,
      time: new Date().toLocaleString(),
      error,
    });
    await WalletHistoryService.create({
      userId: req.user.id,
      event_type: "payment_done_error",
      amount,
      payment_type: "credit",
      logs: JSON.stringify(error, null, 2),
    });
    next({ status: error.status, message: error.details || error.message });
  }
};

export const history = async (req, res, next) => {
  const {  page = 1, limit = 50, id, start_date, end_date } = req.query;
  const userId = req.user.id
  try {

    const result = await WalletHistoryService.read({page, limit, id, start_date, end_date, userId});
    res.success(result);
  } catch (error) {
    console.error("[Payment.controller.mjs/history]: error", {
      userId: req.user.id,
      time: new Date().toLocaleString(),
      error,
    });
    next({ status: error.status, message: error.details || error.message });
  }
};
