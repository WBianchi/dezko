import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
    MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  },
  runtimeEnv: {
    MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY,
    NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
  },
})
