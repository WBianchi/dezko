export const mercadoPagoConfig = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "APP_USR-caa305f9-fd49-41f1-849a-32e99acfddff",
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-1250867385179214-021716-471b79f7cbd0a94478ac9f7d2adad912-1066285780",
  webhookSecret: "e5300334a99289375e00a5b40d9d8db0b64ed8c5ef3eaec4bc2b6ee9c0741f2d",
}
