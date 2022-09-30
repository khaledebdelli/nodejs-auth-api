import sgMail, { MailDataRequired } from "@sendgrid/mail";
import config from "config";
import log from "./logger";

const sendGridApiKey = config.get<string>("sendGridApiKey");

sgMail.setApiKey(sendGridApiKey) 
async function sendEmail(payload: MailDataRequired) {
  sgMail
  .send(payload)
  .then(() => {
    log.info('Email sent successfully')
  })
  .catch((error) => {
    log.error(error, "Error sending email")
  })
}

export default sendEmail;
