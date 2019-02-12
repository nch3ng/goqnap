import sgMail = require("@sendgrid/mail");
import * as fs from'fs';


// const fillTemplate = function(templateString, templateVars){
//   return new Function("return `"+templateString +"`;").call(templateVars);
// }
// const templateVars = {
//   validation_address: 'http://test.com'
// }

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

// const templateString = require('./email.html');
// const templateString = "Hello, ${this.validation_address}";

class Mail {

  email: string;
  templateVars: any;
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // this.email = fillTemplate(html_template, {validation_address: 'http://test.com'});
  }
  sendConfirmation(email: string, user_id: string, token: string, type?: string) {
    let templateString: string;
    let reset:string = '';
    let subject = "QNAP College: Validate your email address";
    let text = 'Click the link to validate your email: ';
    if (!type || type == 'validation')
      templateString = require('./email_validation.html');
    else {
      templateString = require('./email_reset.html');
      reset += '&reset=1'
      subject = "QNAP College: Create your password";
      text = "Click link to create your password";
    }
    this.templateVars = {
      validation_address: process.env.HOST + '/user/verification/' + user_id + '?token=' + token + reset
    }
    this.email = this.fillTemplate(templateString, this.templateVars);
    // console.log(this.fillTemplate(templateString, this.templateVars));
    
    

    const msg = {
      to: email,
      from: 'QNAP College<natecheng@qnap.com>',
      subject: subject,
      text: text + ': ' + process.env.HOST + '/user/verification/' + user_id + '?token=' + token + reset,
      // html: 'Click the link to validate your email: <strong>' + process.env.HOST + '/user/verification/' + user_id + '?token=' + token + '<strong>'
      html: this.email
    }
    sgMail.send(msg, false, (err) => {
      if(err) console.error(err);
      else { 
        // console.log("Sent email to " + email + ": " + process.env.HOST + '/user/verification/' + user_id + '?token=' + token);
      }
    });
  }

  fillTemplate = (templateString, templateVars) => {
    return new Function("return `"+templateString +"`;").call(templateVars);
  }
}

export default Mail;