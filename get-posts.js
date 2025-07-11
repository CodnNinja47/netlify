const axios = require('axios');

exports.handler = async function () {
  const API_KEY = process.env.JSONBIN_API_KEY;
  const BIN_ID = process.env.JSONBIN_ID;

  try {
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': API_KEY
      }
    });

    const posts = response.data.record;
    return {
      statusCode: 200,
      body: JSON.stringify(posts)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al obtener los mensajes', details: error.message })
    };
  }
};
