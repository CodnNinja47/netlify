const axios = require('axios');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

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
      headers,
      body: JSON.stringify(posts)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error al obtener los mensajes', details: error.message })
    };
  }
};
