const fs = require('fs');
const path = require('path');

// Estrutura de arquivos com seus caminhos relativos
const files = [
  '.env',
  '.gitignore',
  'package.json',
  'README.md',
  'backend/app.js',
  'backend/config/db.js',
  'backend/controllers/pdfController.js',
  'backend/models/dadosModel.js',
  'backend/routes/pdfRoutes.js',
  'backend/utils/pdfUtils.js',
  'frontend/index.html',
  'frontend/css/style.css',
  'frontend/js/main.js',
  'frontend/assets/.gitkeep',
];

// Função para popular arquivos com conteúdo
function populateFiles(basePath, fileList) {
  let overwrite = false; // Mude para `true` se quiser sobrescrever arquivos existentes
  try {
    fileList.forEach((file) => {
      const filePath = path.join(basePath, file);
      
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Arquivo não encontrado, criando: ${filePath}`);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Criado diretório: ${dir}`);
        }
      } else if (fs.readFileSync(filePath, 'utf8').trim() === '' && !overwrite) {
        console.log(`⚠️ Arquivo vazio, populando: ${filePath}`);
      } else if (overwrite) {
        console.log(`⚠️ Sobrescrevendo arquivo: ${filePath}`);
      } else {
        console.log(`⚠️ Arquivo já tem conteúdo, pulando: ${filePath}`);
        return;
      }

      // Escreve o conteúdo no arquivo
      fs.writeFileSync(filePath, getFileContent(file), 'utf8');
      console.log(`✅ Conteúdo adicionado ao arquivo: ${filePath}`);
    });
    console.log('🎉 Todos os arquivos foram populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular arquivos:', error.message);
  }
}

// Conteúdo para cada arquivo
function getFileContent(fileName) {
  switch (fileName) {
    case '.gitignore':
      return `
node_modules/
.env
`;
    case 'package.json':
      return JSON.stringify(
        {
          name: 'meu-projeto',
          version: '1.0.0',
          description: 'Projeto para gerar PDFs com assinatura e armazenar dados',
          main: 'backend/app.js',
          scripts: {
            start: 'node backend/app.js',
          },
          dependencies: {},
        },
        null,
        2
      );
    case 'README.md':
      return `# Meu Projeto

Um aplicativo web para gerar PDFs com assinaturas, fazer requisições HTTP e armazenar dados no banco.

## Como Rodar
1. Instale dependências: \`npm install\`
2. Configure o \`.env\` com a conexão do banco
3. Rode o servidor: \`npm start\`
`;
    case '.env':
      return `# Variáveis de ambiente
MONGO_URI=mongodb://localhost:27017/meuDB
PORT=3000
`;
    case 'backend/app.js':
      return `const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const app = express();

app.use(express.json());
app.use(express.static('../frontend'));

// Conectar ao banco
connectDB();

// Importar rotas
const pdfRoutes = require('./routes/pdfRoutes');
app.use('/api', pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Servidor rodando na porta \${PORT}\`));
`;
    case 'backend/config/db.js':
      return `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
    case 'backend/controllers/pdfController.js':
      return `const Dados = require('../models/dadosModel');
const PDFDocument = require('pdfkit');

exports.gerarPDF = async (req, res) => {
  try {
    const { nome, assinatura } = req.body;
    const novoDado = new Dados({ nome, dados: 'PDF gerado' });
    await novoDado.save();

    const doc = new PDFDocument();
    doc.text(\`Assinado por: \${nome}\`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};
`;
    case 'backend/models/dadosModel.js':
      return `const mongoose = require('mongoose');

const DadosSchema = new mongoose.Schema({
  nome: String,
  dados: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dados', DadosSchema);
`;
    case 'backend/routes/pdfRoutes.js':
      return `const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

router.post('/gerar-pdf', pdfController.gerarPDF);

module.exports = router;
`;
    case 'backend/utils/pdfUtils.js':
      return `// Funções auxiliares para PDFs
exports.addSignature = (doc, assinatura) => {
  // Implementar lógica para adicionar assinatura ao PDF
};
`;
    case 'frontend/index.html':
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerar PDF com Assinatura</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <h1>Gerar PDF com Assinatura</h1>
    <form id="form">
      <input type="text" id="nome" placeholder="Seu nome" required>
      <canvas id="canvas" width="300" height="100" style="border:1px solid;"></canvas>
      <button type="button" onclick="gerarPDF()">Gerar PDF</button>
    </form>
  </div>
  <script src="js/main.js"></script>
</body>
</html>
`;
    case 'frontend/css/style.css':
      return `body {
  font-family: Arial, sans-serif;
}
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
canvas {
  background: #f0f0f0;
  margin: 10px 0;
}
`;
    case 'frontend/js/main.js':
      return `async function gerarPDF() {
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
`;
    case 'frontend/assets/.gitkeep':
      return ''; // Arquivo vazio para manter a pasta no git
    default:
      return '';
  }
}

// Executar a população dos arquivos
populateFiles(__dirname, files);