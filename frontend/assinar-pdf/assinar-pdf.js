const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let dataURL = null;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

function startDrawing(e) {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dataURL = null;
});

document.getElementById("saveBtn").addEventListener("click", () => {
  dataURL = canvas.toDataURL("image/png");
  alert("Assinatura salva com sucesso!");
});

document.getElementById("signatureForm").addEventListener("submit",async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const dataNascimento = document.getElementById("dataNascimento").value;

  if (!dataURL) {
    alert("Por favor, faça sua assinatura e cliquem em salvar antes de enviar.");
    return;
  }

  const payload = {nome,cpf,dataNascimento,assinatura: dataURL};
  const res = await fetch("/api/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok){
    alert(json.error ?? "Falha no envio.");
    return;
  }

  const dados = { nome, cpf, dataNascimento, dataURL };
  console.log("Dados enviados:", dados);
  alert("Dados enviados com sucesso");
});
