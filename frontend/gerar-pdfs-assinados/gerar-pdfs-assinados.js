//Configurar PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

        // Variáveis globais
        let pdfDoc = null;
        let scale = 1.5;
        let csvData = [];
        let csvHeaders = [];
        let signatureFields = [];
        let currentFieldId = 0;
        let uploadedPDF = null;
        let uploadedCSV = null;
        let pdfCanvas = null;

        // Elementos DOM
        const pdfFileInput = document.getElementById('pdfFile');
        const csvFileInput = document.getElementById('csvFile');
        const loadFilesBtn = document.getElementById('loadFilesBtn');
        const previewContainer = document.getElementById('previewContainer');
        const fieldList = document.getElementById('fieldList');
        const fieldNameInput = document.getElementById('fieldName');
        //const addFieldBtn = document.getElementById('addFieldBtn');
        const generateZipBtn = document.getElementById('generateZipBtn');
        const statusMessage = document.getElementById('statusMessage');
        const csvColumnsInfo = document.getElementById('csvColumnsInfo');
        const columnsList = document.getElementById('columnsList');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        // Event Listeners
        loadFilesBtn.addEventListener('click', loadFiles);
       // addFieldBtn.addEventListener('click', addSignatureField);
        generateZipBtn.addEventListener('click', generateZipWithPDFs);

        // Event listener para quando o arquivo CSV é selecionado
        csvFileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                readCSVHeaders(this.files[0]);
            }
        });

        // Função para ler os cabeçalhos do CSV
        async function readCSVHeaders(file) {
            try {
                const csvText = await readFileAsText(file);
                const lines = csvText.split('\n');
                if (lines.length > 0) {
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    csvHeaders = headers;
                    displayCSVHeaders(headers);
                }
            } catch (error) {
                console.error('Erro ao ler cabeçalhos do CSV:', error);
            }
        }

        // Função para exibir os cabeçalhos do CSV
        function displayCSVHeaders(headers) {
            columnsList.innerHTML = '';
            headers.forEach(header => {
                const columnTag = document.createElement('span');
                columnTag.className = `column-tag ${header}`;
                columnTag.textContent = header;
                columnsList.appendChild(columnTag);
            });
            csvColumnsInfo.style.display = 'block';
        }

        // Função para carregar os arquivos
        async function loadFiles() {
            const pdfFile = pdfFileInput.files[0];
            const csvFile = csvFileInput.files[0];
            
            if (!pdfFile || !csvFile) {
                showStatus('Por favor, selecione ambos os arquivos (PDF e CSV).', 'error');
                return;
            }
            
            try {
                showStatus('Carregando arquivos...', '');
                
                uploadedPDF = pdfFile;
                uploadedCSV = csvFile;
                
                // Carregar PDF para visualização
                const reader = new FileReader();
                reader.onload = async function() {
                    const typedarray = new Uint8Array(this.result);
                    const loadingTask = pdfjsLib.getDocument(typedarray);
                    pdfDoc = await loadingTask.promise;
                    await renderPage(1);
                    
                    // Carregar CSV e criar campos APÓS o PDF ser renderizado
                    const csvText = await readFileAsText(csvFile);
                    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                    csvData = results.data;
                    csvHeaders = results.meta.fields || [];
                    
                    // Criar campos arrastáveis automaticamente baseados nas colunas do CSV
                    createAutoFieldsFromCSV();
                    
                    showStatus(`Arquivos carregados com sucesso! ${csvData.length} registros encontrados.`, 'success');
                    generateZipBtn.disabled = false;
                };
                reader.readAsArrayBuffer(pdfFile);
                
            } catch (error) {
                console.error('Erro ao carregar arquivos:', error);
                showStatus('Erro ao carregar os arquivos. Verifique se são válidos.', 'error');
            }
        }

        // Função para renderizar página do PDF
        async function renderPage(num) {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: scale });
            
            // Criar canvas
            pdfCanvas = document.createElement('canvas');
            const ctx = pdfCanvas.getContext('2d');
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;
            
            // Limpar container de preview
            previewContainer.innerHTML = '';
            previewContainer.appendChild(pdfCanvas);
            
            // Renderizar página
            const renderContext = { canvasContext: ctx, viewport: viewport };
            await page.render(renderContext).promise;
        }

        // Função para criar campos automaticamente baseados nas colunas do CSV
        function createAutoFieldsFromCSV() {
            // Limpar campos existentes
            signatureFields.forEach(field => {
                if (field.element && field.element.parentNode) {
                    field.element.parentNode.removeChild(field.element);
                }
            });
            signatureFields = [];
            
            // Criar campos apenas para colunas que NÃO são 
            const camposParaIgnorar = [];
            const colunasParaCampos = csvHeaders.filter(header => !camposParaIgnorar.includes(header.toLowerCase()));
            
            if (colunasParaCampos.length === 0) {
                showStatus('CSV carregado, mas não foram encontradas colunas além de "nome" e "cpf". Adicione campos manualmente.', 'success');
                return;
            }
            
            colunasParaCampos.forEach((header, index) => {
                createSignatureField(header, 50 + index * 150, 50);
            });
            
            // Atualizar lista de campos
            updateFieldList();
            
            showStatus(`${colunasParaCampos.length} campos criados automaticamente. Arraste-os para as posições desejadas.`, 'success');
        }

        // Função para criar um campo de assinatura
        function createSignatureField(fieldName, x, y) {
            const fieldId = `field-${currentFieldId++}`;
            const fieldElement = document.createElement('div');
            fieldElement.id = fieldId;
            fieldElement.className = 'draggable-field';
            fieldElement.textContent = fieldName;
            fieldElement.style.left = `${x}px`;
            fieldElement.style.top = `${y}px`;
            
            // Adicionar ao container de preview (que agora contém o canvas)
            previewContainer.appendChild(fieldElement);
            
            // Salvar informações do campo
            signatureFields.push({
                id: fieldId,
                name: fieldName,
                x: x,
                y: y,
                element: fieldElement
            });
            
            // Tornar arrastável
            makeDraggable(fieldElement);
            
            return fieldElement;
        }

        // Função para tornar elemento arrastável
        function makeDraggable(el) {
            el.onmousedown = function(e) {
                let offsetX = e.clientX - el.offsetLeft;
                let offsetY = e.clientY - el.offsetTop;
                
                function onMouseMove(e) {
                    const containerRect = previewContainer.getBoundingClientRect();
                    let x = e.clientX - offsetX;
                    let y = e.clientY - offsetY;
                    
                    // Limitar ao container
                    x = Math.max(0, Math.min(x, containerRect.width - el.offsetWidth));
                    y = Math.max(0, Math.min(y, containerRect.height - el.offsetHeight));
                    
                    el.style.left = x + "px";
                    el.style.top = y + "px";
                    
                    // Atualizar posição no array
                    const fieldIndex = signatureFields.findIndex(f => f.id === el.id);
                    if (fieldIndex !== -1) {
                        signatureFields[fieldIndex].x = x;
                        signatureFields[fieldIndex].y = y;
                        updateFieldList();
                    }
                }
                
                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                
                e.preventDefault();
            };
        }

        // Função para ler arquivo como texto
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = e => reject(e);
                reader.readAsText(file);
            });
        }

        // Função para adicionar campo de assinatura manualmente
        function addSignatureField() {
            const fieldName = fieldNameInput.value.trim();
            if (!fieldName) {
                showStatus('Por favor, digite um nome para o campo.', 'error');
                return;
            }
            
            // Criar campo arrastável
            createSignatureField(fieldName, 50 + signatureFields.length * 150, 50);
            
            // Atualizar lista de campos
            updateFieldList();
            
            // Limpar campo de entrada
            fieldNameInput.value = '';
            
            showStatus(`Campo "${fieldName}" adicionado. Arraste para posicioná-lo.`, 'success');
        }

        // Função para atualizar a lista de campos
        function updateFieldList() {
            if (signatureFields.length === 0) {
                fieldList.innerHTML = '<p>Nenhum campo adicionado ainda</p>';
                return;
            }
            
            fieldList.innerHTML = '';
            signatureFields.forEach(field => {
                const fieldItem = document.createElement('div');
                fieldItem.className = 'field-item';
                
                fieldItem.innerHTML = `
                    <span class="field-name">${field.name}</span>
                    <span class="field-position">(${Math.round(field.x)}, ${Math.round(field.y)})</span>
                    <button class="btn" onclick="removeField('${field.id}')">Remover</button>
                `;
                
                fieldList.appendChild(fieldItem);
            });
        }

        // Função para remover campo
        function removeField(fieldId) {
            const fieldIndex = signatureFields.findIndex(f => f.id === fieldId);
            if (fieldIndex !== -1) {
                const field = signatureFields[fieldIndex];
                field.element.remove();
                signatureFields.splice(fieldIndex, 1);
                updateFieldList();
                showStatus('Campo removido.', 'success');
            }
        }

        // Função para atualizar a barra de progresso
        function updateProgress(percentage, text) {
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = text;
        }

        // Função para gerar ZIP com todos os PDFs
        async function generateZipWithPDFs() {
            if (!uploadedPDF || !uploadedCSV || signatureFields.length === 0) {
                showStatus('Por favor, carregue os arquivos e adicione pelo menos um campo de assinatura.', 'error');
                return;
            }
            
            try {
                showStatus('Gerando ZIP com PDFs assinados...', '');
                generateZipBtn.disabled = true;
                progressContainer.style.display = 'block';
                
                const pdfBytes = await uploadedPDF.arrayBuffer();
                const csvText = await uploadedCSV.text();
                const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                const rows = results.data;

                const zip = new JSZip();
                const totalRecords = rows.length;

                for (let i = 0; i < rows.length; i++) {
                    // Atualizar progresso
                    const progress = Math.round((i / totalRecords) * 100);
                    updateProgress(progress, `Processando ${i+1} de ${totalRecords} documentos...`);

                    const doc = await PDFLib.PDFDocument.load(pdfBytes);
                    const page = doc.getPages()[0];
                    const { width: pageWidth, height: pageHeight } = page.getSize();

                    // Embed a fonte padrão
                    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);

                    const canvasRect = pdfCanvas.getBoundingClientRect();

                    signatureFields.forEach(field => {
                        const rect = field.element.getBoundingClientRect();
                        
                        // Posição relativa ao canvas
                        const xRel = rect.left - canvasRect.left;
                        const yRel = rect.top - canvasRect.top;

                        // Ajuste de escala entre canvas e PDF
                        const x = (xRel / pdfCanvas.width) * pageWidth;
                        const y = pageHeight - (yRel / pdfCanvas.height) * pageHeight - 12; // ajusta altura do texto

                        const fieldValue = rows[i][field.name] || '';
                        if (fieldValue) {
                            page.drawText(fieldValue.toString(), { 
                                x, 
                                y, 
                                size: 12, 
                                font,
                                color: PDFLib.rgb(0, 0, 0)
                            });
                        }
                    });

                    const newPdf = await doc.save();
                    const fileName = `documento_${cleanFileName(rows[i].nome)}_${cleanFileName(rows[i].cpf)}.pdf`;
                    zip.file(fileName, newPdf);

                    // Pequeno delay para não sobrecarregar o navegador
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                // Atualizar progresso para 100%
                updateProgress(100, 'Finalizando arquivo ZIP...');

                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, "documentos_assinados.zip");

                showStatus(`ZIP gerado com sucesso! ${rows.length} documentos incluídos.`, 'success');
                generateZipBtn.disabled = false;
                progressContainer.style.display = 'none';

            } catch (error) {
                console.error('Erro ao gerar ZIP:', error);
                showStatus('Erro ao gerar ZIP. Tente novamente.', 'error');
                generateZipBtn.disabled = false;
                progressContainer.style.display = 'none';
            }
        }

        // Função para limpar nome de arquivo
        function cleanFileName(name) {
            if (!name) return 'sem_nome';
            return name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        }

        // Função para mostrar mensagens de status
        function showStatus(message, type) {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message';
            
            if (type === 'success') {
                statusMessage.classList.add('success');
            } else if (type === 'error') {
                statusMessage.classList.add('error');
            }
            
            // Limpar mensagem após 5 segundos (exceto para mensagens de erro)
            if (type !== 'error') {
                setTimeout(() => {
                    statusMessage.textContent = '';
                    statusMessage.className = 'status-message';
                }, 5000);
            }
        }

        // Tornar a função removeField global para ser acessível pelo onclick
        window.removeField = removeField;

