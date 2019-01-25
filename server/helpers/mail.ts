import sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class Mail {
  sendConfirmation(email: string, user_id: string, token: string) {
    const msg = {
      to: email,
      from: 'QNAP College<naichen.cheng@gmail.com>',
      subject: 'QNAP College: Validate your email address',
      text: 'Click the link to validate your email: ' + process.env.HOST + '/user/verification/' + user_id + '?token=' + token,
      html: 'Click the link to validate your email: <strong>' + process.env.HOST + '/user/verification/' + user_id + '?token=' + token + '<strong>'
    }
    sgMail.send(msg, false, (err) => {
      if(err) console.error(err);
      else console.log("Sent email");
    });
  }
}

export default Mail;