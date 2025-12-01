// functions/chat.js
// Versão Nativa (Sem dependências externas)

exports.handler = async function(event, context) {
  // Permite conexões de qualquer lugar (CORS)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Lida com a verificação inicial do navegador (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.DEEPINFRA_API_KEY; 

    if (!apiKey) {
      console.error("ERRO: Chave API ausente.");
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Chave API não configurada no servidor." }) };
    }

    console.log("Enviando mensagem para DeepInfra...");

    // Usando o fetch nativo do Node.js 18+
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
            { role: "system", content: "Você é um assistente de IA neutro, útil e altamente profissional. Responda em Português do Brasil." },
            { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7 
      }),
    });

    const data = await response.json();
    console.log("Resposta recebida:", data);

    if (data.error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message || "Erro na DeepInfra" }) };
    }

    if (!data.choices || data.choices.length === 0) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "A IA não retornou resposta." }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: data.choices[0].message.content })
    };

  } catch (err) {
    console.error("Erro CRÍTICO na função:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Erro interno do servidor." }) };
  }
};