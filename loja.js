// loja.js

/* CARREGAR PRODUTO */
const produto = JSON.parse(localStorage.getItem("produtoCheckout"));
let descontoCupom = 0;
let valorFinal = 0;

function atualizarResumo() {
    if (!produto) return;
    const preco = produto.preco;
    valorFinal = preco * ((100 - descontoCupom) / 100);

    document.getElementById("produtoNome").innerText = produto.nome;
    document.getElementById("produtoPreco").innerText = `R$ ${preco.toFixed(2)}`;
    document.getElementById("subtotal").innerText = `R$ ${preco.toFixed(2)}`;
    document.getElementById("total").innerText = `R$ ${valorFinal.toFixed(2)}`;
    document.getElementById("totalBotao").innerText = `R$ ${valorFinal.toFixed(2)}`;
}

atualizarResumo();

/* APLICAR CUPOM */
function aplicarCupom() {
    const cupomInput = document.getElementById("cupom").value.trim();
    if (!cupomInput) return alert("Digite um cupom válido!");

    fetch("http://localhost:3000/cupom", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({cupom: cupomInput})
    })
    .then(r => r.json())
    .then(d => {
        if(d.desconto){
            descontoCupom = d.desconto;
            alert(`Cupom aplicado! Desconto de ${descontoCupom}%`);
            atualizarResumo();
        } else {
            descontoCupom = 0;
            alert("Cupom inválido");
            atualizarResumo();
        }
    })
    .catch(err => console.error("Erro cupom:", err));
}

/* PAGAMENTO */
async function pagar() {
    let valido = true;
    const campos = ["nome","sobrenome","email","idcidade","cpf","telefone"];

    campos.forEach(id=>{
        const campo = document.getElementById(id);
        const erro = campo.nextElementSibling;
        if(!campo.value){
            erro.style.display="block";
            valido=false;
        } else{
            erro.style.display="none";
        }
    });

    const termos = document.getElementById("termos");
    if(!termos.checked){
        document.getElementById("erroTermos").style.display="block";
        valido=false;
    } else{
        document.getElementById("erroTermos").style.display="none";
    }

    if(!valido) return;

    try{
        const response = await fetch("http://localhost:3000/pix",{
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body:JSON.stringify({
                produto: produto.nome,
                valor: produto.preco,
                discord: document.getElementById("nome").value,
                cupom: document.getElementById("cupom").value.trim()
            })
        });

        const data = await response.json();

        document.getElementById("pixArea").style.display="block";
        document.getElementById("qrcode").src = "data:image/png;base64," + data.qr_code_base64;
        document.getElementById("pixCode").innerText = data.qr_code;

    } catch(err){
        alert("Não foi possível gerar PIX. Tente novamente mais tarde.");
        console.error(err);
    }
}