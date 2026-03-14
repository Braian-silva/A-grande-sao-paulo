async function pagar(){

let produto = document.getElementById("produto").value
let valor = document.getElementById("valor").value
let discord = document.getElementById("discord").value
let cupom = document.getElementById("cupom").value

let req = await fetch("http://localhost:3000/pix",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
produto,
valor,
discord,
cupom
})

})

let data = await req.json()

document.getElementById("qrcode").src =
"data:image/png;base64," + data.qr_code_base64

document.getElementById("copiacola").value =
data.qr_code

document.getElementById("linkmp").href =
data.ticket_url

}