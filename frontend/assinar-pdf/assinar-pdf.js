async function assinarPDF() {
  const nome = document.getElementById('nome').value;
  const canvas = document.getElementById('canvas');
  const assinatura = canvas.toDataURL();

  try {
    const response = await fetch('/api/gerar-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, assinatura }),
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento-assinado.pdf';
    a.click();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao gerar PDF');
  }
}

// Lógica para capturar assinatura no canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => {
  drawing = true;
  ctx.beginPath();
});
canvas.addEventListener('mouseup', () => (drawing = false));
canvas.addEventListener('mousemove', (e) => {
  if (drawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});