//class
// @ts-ignore
// const Openpay = require('openpay');
import * as Openpay from "openpay";
import * as util from "util";
import type { NextApiRequest, NextApiResponse } from "next";

const ID = process.env.OPENPAY_ID;
const PRIVATE_KEY = process.env.OPENPAY_PRIVATE_KEY;
const isProduction = process.env.NODE_ENV === "production";

//instantiation
const openpay = new Openpay(ID, PRIVATE_KEY, isProduction);

const chargesCreateAsync = util.promisify(openpay.charges.create);

//use the api
// openpay.< resource_name >.< method_name >( ... )

type Data = {
  [key: string]: string | any
}

/**
 * ```
 * $chargeData = array(
 *     'method' => 'card',
 *     'source_id' => $_POST["token_id"],
 *     'amount' => $_POST["amount"], // formato númerico con hasta dos dígitos decimales.
 *     'description' => $_POST["description"],
 *     'use_card_points' => $_POST["use_card_points"], // Opcional, si estamos usando puntos
 *     'device_session_id' => $_POST["deviceIdHiddenFieldName"],
 *     'customer' => $customer
 *     );
 * ```
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const { method, source_id, amount, description, use_card_points, device_session_id, customer } = JSON.parse(req.body);
  console.log("Openpay", Openpay);

  const payload = {
    method,
    source_id,
    amount: Number(amount).toFixed(2),
    description,
    use_card_points,
    device_session_id,
    customer
  };

  console.log("Openpay payload", payload);

  try {
    const charge = await chargesCreateAsync(payload);
    console.log("charge applied?", JSON.stringify(charge));
    return res.status(200).json({
      success: true,
      ...payload,
      timeout: true
    });
  } catch (e: any) {
    console.log("An error occurred during the charge", JSON.stringify(e));
    return res.status(e?.http_code || 500)
      .json({
        success: false,
        error: e
      });
  }
}