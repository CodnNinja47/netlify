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
    const { autor, mensaje, categoria } = JSON.parse(event.body);

    // 1. Obtener el contenido actual del bin
    const getResponse = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        "X-Master-Key": apiKey,
      }
    });

    const datosActuales = getResponse.data.record;

    // 2. Crear nuevo mensaje con estructura completa
    const nuevoComentario = {
      autor,
      mensaje,
      fecha: new Date().toLocaleString("es-ES"), // formato legible
      respuestas: [],
      categoria
    };

    // 3. Si los datos actuales no son array, inicializar uno
    const nuevosDatos = Array.isArray(datosActuales)
      ? [...datosActuales, nuevoComentario]
      : [datosActuales, nuevoComentario];

    // 4. Actualizar el bin
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
