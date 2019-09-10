require('dotenv').config();


module.exports = {

  port: process.env.PORT || 3000,

  airtableApiKey: process.env.AIRTABLE_API_KEY || '',

}
