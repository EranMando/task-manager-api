const mailgun = require('mailgun-js')

const mailgunAPIKey = process.env.SENDGRID_API_KEY
const Domain = 'sandbox7d6f5b056fc049069614235464fb3b6b.mailgun.org'
const mg = mailgun({apiKey: mailgunAPIKey, domain: Domain})

const sendWelcomeEmail = (email,name) => {
   mg.messages().send({
      to: email,
      from: 'aeranm1@sandbox7d6f5b056fc049069614235464fb3b6b.mailgun.org',
      subject: 'Thanks for joining in',
      text: `Welcome to the app, ${name}. Let me know how you get along with the app.`

   }, (error,body) => {
      if(error){
         console.log(error)
         return
      }
      console.log(body)
   })
}

const sendCancelationEmail = (email,name) => {
   mg.messages().send({
      to: email,
      from: 'aeranm1@sandbox7d6f5b056fc049069614235464fb3b6b.mailgun.org',
      subject: 'Sorry to see you go',
      text: `Goodbye ${name}. Hope to see you back soon.`

   }, (error,body) => {
      if(error){
         console.log(error)
         return
      }
      console.log(body)
   })
}

module.exports = {
   sendWelcomeEmail,
   sendCancelationEmail
}
