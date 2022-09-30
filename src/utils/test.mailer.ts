import nodemailer, { SendMailOptions } from "nodemailer";
import config from "config";
import log from "./logger";
// async function createTestCredentials() {
//   const credentials = await nodemailer.createTestAccount();
//   console.log({ credentials });
// }
// createTestCredentials()

const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>("smtp");

const transport = nodemailer.createTransport({
  ...smtp,
  auth: { user: smtp.user, pass: smtp.pass }
});
async function sendEmail(payload: SendMailOptions) {
    transport.sendMail(payload, (err, info) => {
        if (err) {
            log.error(err, "Error sending email")
            return
        }
        log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)})`)
    })
}

export default sendEmail;
