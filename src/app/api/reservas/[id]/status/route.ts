import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservaId = params.id

    // Buscar pagamento mais recente da reserva
    const pagamento = await prisma.payment.findFirst({
      where: { reservationId: reservaId },
      orderBy: { createdAt: "desc" },
      include: {
        reservation: {
          include: {
            espaco: true,
          },
        },
      },
    })

    if (!pagamento) {
      return NextResponse.json(
        { message: "Pagamento não encontrado" },
        { status: 404 }
      )
    }

    // Se o pagamento já estiver aprovado, retornar status
    if (pagamento.status === "approved") {
      return NextResponse.json({ status: "pago" })
    }

    // Se for PIX, verificar status no Mercado Pago
    if (pagamento.paymentMethod === "pix") {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${pagamento.gatewayId}`,
        {
          headers: {
            Authorization: `Bearer ${pagamento.reservation.espaco.mercadoPagoAccessToken}`,
          },
        }
      )

      const data = await response.json()

      // Atualizar status no banco
      if (data.status === "approved") {
        await prisma.payment.update({
          where: { id: pagamento.id },
          data: { status: "approved" },
        })

        return NextResponse.json({ status: "pago" })
      }
    }

    // Se não estiver pago, retornar status atual
    return NextResponse.json({ status: pagamento.status })
  } catch (error: any) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json(
      { message: error.message || "Erro ao verificar status" },
      { status: 500 }
    )
  }
}
