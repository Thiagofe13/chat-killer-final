// functions/chat.js
// Este código roda no servidor do Netlify, protegendo a chave

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.DEEPINFRA_API_KEY; 

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Chave API não configurada no Netlify." }) };
    }

    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`, // A chave é injetada aqui
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
            { role: "system", content: "Você é um assistente de IA neutro, útil e altamente profissional. Responda a todas as perguntas em Português do Brasil de forma concisa e objetiva. Seu objetivo é fornecer informações precisas e ser um interlocutor sério." },
            { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7 
      }),
    });

    const data = await response.json();
    
    if (data.error || !data.choices || data.choices.length === 0) {
        return { statusCode: 500, body: JSON.stringify({ error: data.error.message || "Erro na resposta da DeepInfra." }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: data.choices[0].message.content })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Erro interno na Função." }) };
  }
};