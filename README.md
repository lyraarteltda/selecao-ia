# Seleção IA

Triagem de currículos em lote com IA (BYOK) para a comunidade Maestros da IA.
Rubrica ponderada → avaliação por currículo → ranking determinístico → exportação .xlsx/.csv/PDF.

Site estático (Netlify). Único backend: webhooks n8n do gate compartilhado. Nenhum dado de candidato sai do navegador, exceto para o provedor de IA da chave do próprio usuário.

Bibliotecas vendorizadas: pdf.js 4.10.38 (Apache-2.0), xlsx-js-style 1.2.0 (Apache-2.0) — ver vendor/.
