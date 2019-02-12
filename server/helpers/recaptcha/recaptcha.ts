import * as rp from 'request-promise';

export default class Recaptcha {
    static verify = (token, remote_ip) => {
        const recpatcha_secret = process.env.reCAPTCHA_SECRET;
        const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + recpatcha_secret + "&response=" + token + "&remoteip=" + remote_ip;
        return rp(verificationUrl);
    }
}