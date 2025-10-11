const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const Dados = require('../models/dadosModel');

exports.gerarPDF = async (req, res) => {
  try {
    const { nome, assinatura, nomePosX, nomePosY, assinaturaPosX, assinaturaPosY } = req.body;
    const pdfFile = req.files?.pdf;
    const csvFile = req.files?.csv;

    // Salvar metadados no SQLite
    const dados = {
      nome,
      pdf: pdfFile ? pdfFile.filename : 'Nenhum PDF carregado',
      csv: csvFile ? csvFile.filename : 'Nenhum CSV carregado',
      nomePosX,
      nomePosY,
      assinaturaPosX,
      assinaturaPosY,
    };
    Dados.save(nome, JSON.stringify(dados));

    // Criar ou carregar PDF
    let doc;
    if (pdfFile) {
      const existingPdfBytes = await fs.readFile(pdfFile.path);
      doc = await PDFDocument.load(existingPdfBytes);
    } else {
      doc = await PDFDocument.create();
    }

    const page = pdfFile ? doc.getPage(0) : doc.addPage();
    const pageHeight = page.getHeight();

    // Adicionar nome
    page.drawText(nome, {
      x: parseFloat(nomePosX) || 50,
      y: pageHeight - (parseFloat(nomePosY) || 50) - 20, // Ajustar para origem no topo
      size: 20,
    });

    // Adicionar assinatura
    if (assinatura) {
      const base64Data = assinatura.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const image = await doc.embedPng(buffer);
      page.drawImage(image, {
        x: parseFloat(assinaturaPosX) || 50,
        y: pageHeight - (parseFloat(assinaturaPosY) || 150) - 100, // Ajustar para origem no topo
        width: 100,
        height: 100,
      });
    }

    const pdfBytes = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=documento-assinado.pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};