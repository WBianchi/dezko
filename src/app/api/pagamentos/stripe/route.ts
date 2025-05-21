import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

// Inicialização do objeto Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
})

// Porcentagem de comissão da plataforma (ex: 10%)
const PLATFORM_FEE_PERCENT = 10

export async function POST(request: NextRequest) {
  try {
    // Extrair dados do corpo da requisição
    const body = await request.json()
    const { reservationId, paymentMethodId, dadosPagador } = body

    if (!reservationId || !paymentMethodId) {
      return NextResponse.json(
        { error: "ID da reserva e ID do método de pagamento são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar dados da reserva no banco de dados
    // Buscando apenas os dados essenciais da reserva e do espaço
    const reserva = await prisma.reservation.findUnique({
      where: { id: reservationId },
    }) as any
    
    if (!reserva) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      )
    }
    
    // Buscando o espaço separadamente
    const espaco = await prisma.espaco.findUnique({
      where: { id: reserva.espacoId },
    }) as any

    // Verificar se o espaço possui uma conta Stripe Connect
    const connectedAccountId = espaco.stripeConnectAccountId

    if (!connectedAccountId) {
      return NextResponse.json(
        { error: "O proprietário deste espaço não possui integração com Stripe" },
        { status: 400 }
      )
    }

    // Calcular valores para o split payment
    const valorTotalCentavos = Math.round(reserva.valor * 100)
    const valorComissaoCentavos = Math.round(valorTotalCentavos * (PLATFORM_FEE_PERCENT / 100))
    const valorProprietarioCentavos = valorTotalCentavos - valorComissaoCentavos

    // Criar um cliente no Stripe (ou recuperar um existente)
    let customer
    const metadata = {
      reservationId: reservationId,
      spaceId: reserva.espacoId,
      customerName: dadosPagador.nome,
      customerEmail: dadosPagador.email,
      customerCPF: dadosPagador.cpf
    }

    // Verificar se já existe um cliente com o e-mail fornecido
    const existingCustomers = await stripe.customers.list({
      email: dadosPagador.email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      
      // Atualizar os metadados do cliente
      await stripe.customers.update(customer.id, { metadata })
    } else {
      // Criar um novo cliente
      customer = await stripe.customers.create({
        email: dadosPagador.email,
        name: dadosPagador.nome,
        metadata
      })
    }

    // Anexar o método de pagamento ao cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Criar PaymentIntent com o split payment usando transfer_data
    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorTotalCentavos,
      currency: "brl",
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      customer: customer.id,
      metadata: {
        reservationId: reservationId,
        spaceId: reserva.espacoId,
        spaceName: espaco.nome
      },
      description: `Reserva do espaço: ${espaco.nome}`,
      transfer_data: {
        destination: connectedAccountId,
        amount: valorProprietarioCentavos // Valor a ser transferido para o proprietário do espaço
      },
      application_fee_amount: valorComissaoCentavos, // Comissão da plataforma
      receipt_email: dadosPagador.email,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/reservas/confirmacao/${reservationId}`
    })

    // Atualizar status da reserva para "PENDENTE" (será confirmado pelo webhook)
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { 
        status: "PENDENTE",
        // @ts-ignore - campo existe no banco mas não no tipo
        paymentMethod: "STRIPE",
        // @ts-ignore - campo existe no banco mas não no tipo
        paymentId: paymentIntent.id
      }
    })

    // Retornar resultado do pagamento
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error)
    
    return NextResponse.json(
      { 
        error: "Falha ao processar pagamento", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
