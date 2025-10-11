// Lógica para navegação por abas
document.querySelectorAll('.tab-link').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remover classe 'active' de todas as abas e conteúdos
    document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Adicionar 'active' à aba clicada e seu conteúdo
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Lógica para gerar PDF
async function gerarPDF() {
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
    a.download = 'documento.pdf';
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

// Lógica para upload de PDF
document.getElementById('form-upload-pdf').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  const pdfFile = document.getElementById('pdf-file').files[0];
  formData.append('pdf', pdfFile);

  try {
    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    alert(result.message || 'PDF enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar PDF:', error);
    alert('Erro ao enviar PDF');
  }
});