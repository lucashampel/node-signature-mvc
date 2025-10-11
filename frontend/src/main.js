// Arquivo principal que pode importar outros módulos
import './gerar-pdfs-assinados.js';

// Funções para comunicação com API
export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`Erro API: ${response.status}`);
  }
  
  return response.json();
}

// Exemplo de uso:
// const result = await apiRequest('/processar-pdf', { 
//   method: 'POST', 
//   body: JSON.stringify(data) 
// });