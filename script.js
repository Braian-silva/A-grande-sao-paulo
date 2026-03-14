/* ===== MODAIS ===== */
function abrirModal(){ document.getElementById("modalTermos").style.display="flex"; }
function fecharModal(){ document.getElementById("modalTermos").style.display="none"; }

function abrirLoginAdmin(){ document.getElementById("modalLoginAdmin").style.display="flex"; }
function fecharLoginAdmin(){ document.getElementById("modalLoginAdmin").style.display="none"; }

/* ===== LOGIN ADMIN ===== */
function loginAdmin(){
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if(user === "administrador" && pass === "147821@"){
    fecharLoginAdmin();
    localStorage.setItem("adminLogado","true");
    window.location.href = "admin.html";
  }else{
    document.getElementById("erroAdmin").style.display="block";
  }
}

/* ===== CHECKOUT ===== */
const produto = JSON.parse(localStorage.getItem("produtoCheckout"));
if(produto){
  document.getElementById("produtoNome").innerText = produto.nome;
  document.getElementById("produtoPreco").innerText = "R$ "+produto.preco.toFixed(2);
  document.getElementById("subtotal").innerText = "R$ "+produto.preco.toFixed(2);
  document.getElementById("total").innerText = "R$ "+produto.preco.toFixed(2);
  document.getElementById("totalBotao").innerText = "R$ "+produto.preco.toFixed(2);
}

async function pagar(){
  let valido = true;
  const campos = ["nome","sobrenome","email","idcidade","cpf","telefone"];
  campos.forEach(id=>{
    const campo = document.getElementById(id);
    const erro = campo.nextElementSibling;
    if(!campo.value){ erro.style.display="block"; valido=false; }else{ erro.style.display="none"; }
  });
  const termos = document.getElementById("termos");
  if(!termos.checked){ document.getElementById("erroTermos").style.display="block"; valido=false; }
  else{ document.getElementById("erroTermos").style.display="none"; }
  if(!valido) return;

  try{
    const response = await fetch("http://localhost:3000/pix",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ produto: produto.nome, valor: produto.preco, discord: document.getElementById("nome").value })
    });
    const data = await response.json();
    document.getElementById("pixArea").style.display="block";
    document.getElementById("qrcode").src = "data:image/png;base64," + data.qr_code_base64;
    document.getElementById("pixCode").innerText = data.qr_code;
  }catch(err){ alert("Não foi possível gerar PIX."); console.error(err);}
}

/* ===== CUPOM ===== */
function aplicarCupom(){
  const cupom = document.getElementById("cupom").value;
  if(cupom === "PROMO10"){
    const desconto = produto.preco * 0.1;
    const novoTotal = produto.preco - desconto;
    document.getElementById("total").innerText = "R$ "+novoTotal.toFixed(2);
    document.getElementById("totalBotao").innerText = "R$ "+novoTotal.toFixed(2);
    alert("Cupom aplicado! 10% de desconto.");
  } else{
    alert("Cupom inválido.");
  }
}