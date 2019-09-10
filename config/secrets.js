require('dotenv').config();


module.exports = {

  port: process.env.PORT || 3002,

  airtableApiKey: process.env.AIRTABLE_API_KEY || '',

}
