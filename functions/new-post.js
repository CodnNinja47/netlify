const axios = require("axios");

exports.handler = async function(event) {
  const apiKey = process.env.JSONBIN_API_KEY;
  const binId = process.env.JSONBIN_ID;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { autor, comentario } = JSON.parse(event.body);

    // 1. Obtener los datos actuales
    const getResponse = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey,
      }
    });

    const datosActuales = getResponse.data.record;

    // 2. Crear nuevo comentario
    const nuevoComentario = {
      autor,
      comentario,
      fecha: new Date().toISOString()
    };

    // 3. Añadir al array existente (o crear array si está vacío)
    const nuevosDatos = Array.isArray(datosActuales)
      ? [...datosActuales, nuevoComentario]
      : [nuevoComentario];

    // 4. Hacer PUT con los nuevos datos
    await axios.put(`https://api.jsonbin.io/v3/b/${binId}`, nuevosDatos, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey,
        "X-Bin-Private": false
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
