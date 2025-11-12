const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
let isDrawing = false;

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
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const dataURL = canvas.toDataURL();
  localStorage.setItem("assinatura", dataURL);
  alert("Assinatura salva com sucesso!");
});

document.getElementById("signatureForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const dataNascimento = document.getElementById("dataNascimento").value;
  const assinatura = localStorage.getItem("assinatura");

  if (!assinatura) {
    alert("Por favor, faça sua assinatura antes de enviar.");
    return;
  }

  const dados = { nome, cpf, dataNascimento, assinatura };
  console.log("Dados enviados:", dados);
  alert("Dados enviados com sucesso!");
});
