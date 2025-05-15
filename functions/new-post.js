const axios = require('axios');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    // Preflight request
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Método no permitido'
    };
  }

  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID = process.env.JSONBIN_ID;

  try {
    const body = JSON.parse(event.body);

    // Obtener datos actuales del bin
    const { data } = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    const posts = data.record;

    if (body.mensajeIndex !== undefined) {
      const index = Number(body.mensajeIndex);

      if (!isNaN(index) && posts[index]) {
        const respuesta = {
          autor: body.autor,
          mensaje: body.mensaje,
          fecha: body.fecha
        };

        if (!Array.isArray(posts[index].respuestas)) {
          posts[index].respuestas = [];
        }

        posts[index].respuestas.push(respuesta);
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Índice de mensaje inválido para respuesta' })
        };
      }
    } else {
      posts.push({
        autor: body.autor,
        mensaje: body.mensaje,
        fecha: body.fecha,
        respuestas: [],
        categoria: body.categoria || "general"
      });
    }

    await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, posts, {
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error al guardar en JSONBin',
        details: error.message
      })
    };
  }
};
