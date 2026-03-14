require("dotenv").config()

const express = require("express")
const axios = require("axios")
const fs = require("fs")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK

// ======================
// CUPONS
// ======================

let cupons = {
VIP10:10,
PROMO20:20
}

// ======================
// CRIAR PAGAMENTO PIX
// ======================

app.post("/api/pix", async (req,res)=>{

const {produto,valor,discord,cupom} = req.body

let valorFinal = Number(valor)

if(cupom && cupons[cupom]){
valorFinal = valor - (valor*(cupons[cupom]/100))
}

try{

const pagamento = await axios.post(
"https://api.mercadopago.com/v1/payments",
{
transaction_amount:valorFinal,
description:produto,
payment_method_id:"pix",
payer:{email:"cliente@email.com"},
additional_info:{
items:[{
title:produto,
quantity:1,
unit_price:valorFinal
}]
}
},
{
headers:{
Authorization:`Bearer ${ACCESS_TOKEN}`,
"Content-Type":"application/json",
"X-Idempotency-Key":Date.now().toString()
}
}
)

res.json({
qr_code:pagamento.data.point_of_interaction.transaction_data.qr_code,
qr_code_base64:pagamento.data.point_of_interaction.transaction_data.qr_code_base64,
ticket_url:pagamento.data.point_of_interaction.transaction_data.ticket_url
})

}catch(e){

console.log(e.response?.data)
res.status(500).json({erro:"Erro pagamento"})

}

})

// ======================
// WEBHOOK MERCADO PAGO
// ======================

app.post("/webhook", async (req,res)=>{

const data = req.body

if(data.type === "payment"){

const payment = await axios.get(
`https://api.mercadopago.com/v1/payments/${data.data.id}`,
{
headers:{Authorization:`Bearer ${ACCESS_TOKEN}`}
}
)

if(payment.data.status === "approved"){

const venda = {
produto:payment.data.description,
valor:payment.data.transaction_amount,
data:new Date()
}

let vendas = JSON.parse(fs.readFileSync("data/vendas.json"))

vendas.push(venda)

fs.writeFileSync("data/vendas.json",JSON.stringify(vendas))

// LOG DISCORD
axios.post(DISCORD_WEBHOOK,{
content:`💰 Venda aprovada\nProduto: ${venda.produto}\nValor: R$${venda.valor}`
})

}

}

res.sendStatus(200)

})

// ======================
// ADMIN API
// ======================

app.get("/admin/vendas",(req,res)=>{

let vendas = JSON.parse(fs.readFileSync("data/vendas.json"))

res.json(vendas)

})

app.get("/admin/faturamento",(req,res)=>{

let vendas = JSON.parse(fs.readFileSync("data/vendas.json"))

let total = vendas.reduce((a,b)=>a+b.valor,0)

res.json({total})

})

app.listen(3000,()=>{
console.log("Servidor rodando porta 3000")
})