const axios = require('axios')

exports.handler = async (event, context) => {
  try {
    const { viewer = '', query = '' } = event.queryStringParameters

    const { data } = await axios(`https://kaartenbak.netlify.app/api/search?viewer=${ viewer }&query=${ query }`)

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      'content-type': 'application/json',
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: 'Something went wrong',
    }
  }
}
