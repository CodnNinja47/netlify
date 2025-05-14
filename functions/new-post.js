const axios = require('axios');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID = process.env.JSONBIN_ID;

  try {
    const body = JSON.parse(event.body);

    // Obtener datos actuales
    const { data } = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    const posts = data.record;

    if (body.mensajeIndex !== undefined) {
      // Es una respuesta
      const respuesta = {
        autor: body.autor,
        mensaje: body.mensaje,
        fecha: body.fecha,
        respondeA: body.respondeA || "mensaje principal"
      };

      posts[body.mensajeIndex].respuestas = posts[body.mensajeIndex].respuestas || [];
      posts[body.mensajeIndex].respuestas.push(respuesta);
    } else {
      // Es un nuevo mensaje
      posts.push({
        autor: body.autor,
        mensaje: body.mensaje,
        fecha: body.fecha,
        respuestas: [],
        categoria: body.categoria || "general"
      });
    }

    // Guardar en JSONBin
    await axios.put(`https://api.jsonbin.io/v3/b/${BIN_ID}`, posts, {
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al guardar en JSONBin', details: error.message })
    };
  }
};
