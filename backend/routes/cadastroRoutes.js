import fs from 'fs';
import path from 'path';
import express from 'express';
import dadosModel from '../models/dadosModel.js';
import { IsValidCPF, IsValidBirthDate } from '../controllers/validator.js';
import { saveDataUrl } from '../config/storage.js';

const router = express.Router();

router.post('/cadastrar', (req, res) => {
    // Logica para cadastrar o usuario, validação de CPF, data de nascimento
    const { nome, cpf, dataNascimento, assinatura } = req.body;
    if (!nome || !cpf || !dataNascimento || !assinatura) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    if (!IsValidCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }
    const birthDate = dataNascimento;
    const birthCheck = IsValidBirthDate(birthDate);
    if (!birthCheck.ok) {
        return res.status(400).json({ error: birthCheck.error });
    }
    //Validacao assinatura
    try {
        const { url: imageUrl } = saveDataUrl(assinatura); // throws se inválido
        dadosModel.save(nome, { cpf, birthDate, imageUrl });
    } catch (e) {
        console.log(e);
        return res.status(400).json({ error: 'Assinatura inválida ou muito grande.' });
    }

    res.status(201).json({ message: 'Nice job!' });
    //Considerar usuario repetido? validação no banco de dados tambem?
});

// router.get('/cadastros', (req, res) => {
//     // Logica de pegar os cadastros, ser capaz de listar de diferentes formas os dados, para visualização
//     try {
//         const results = dadosModel.findAll();
//         res.json(results);
//     } catch (err) {
//         console.error('Erro ao buscar cadastros:', err);
//         res.status(500).json({ error: 'Erro ao buscar cadastros.' });
//     }
// });

export default router;