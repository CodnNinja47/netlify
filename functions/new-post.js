const axios = require("axios");

exports.handler = async function(event) {
  const apiKey = process.env.JSONBIN_API_KEY;
  const binId = process.env.JSONBIN_ID;

  // Responder a preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { autor, mensaje, categoria } = JSON.parse(event.body);

    const getResponse = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey,
      }
    });

    const datosActuales = getResponse.data.record;

    const nuevoComentario = {
      autor,
      mensaje,
      fecha: new Date().toLocaleString("es-ES"),
      respuestas: [],
      categoria
    };

    const nuevosDatos = Array.isArray(datosActuales)
      ? [...datosActuales, nuevoComentario]
      : [datosActuales, nuevoComentario];

    await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, nuevosDatos, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey,
        "X-Bin-Private": false
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
