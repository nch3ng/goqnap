import sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class Mail {
  send() {
    const msg = {
      to: 'boo0330@gmail.com',
      from: 'naichen.cheng@gmail.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail.send(msg, false, (err) => {
      if(err) console.error(err);
      else console.log("Sent email");
    });
  }
}

export default Mail;