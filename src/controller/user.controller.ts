import { Request, Response } from "express";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordSchema,
  VerifyUserInput
} from "../schema/user.schema";
import { createUser, findUserByEmail, findUserById } from "../service/user.service";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";

export async function createUserHandler(req: Request<{}, {}, CreateUserInput>, res: Response) {
  const body = req.body;
  try {
    const user = await createUser(body);
    await sendEmail({
      from: "khaled88ebdelli@gmail.com",
      to: user.email,
      subject: "Please verify your account",
      text: `verification code ${user.verificationCode}\n Id: ${user._id}`
    });
    return res.send("User created successfully");
  } catch (e: any) {
    if (e.code === 11000) {
      res.status(409).send("Account already exists");
    }
    return res.status(500).send(e);
  }
}

export async function verifyUserHandler(req: Request<VerifyUserInput>, res: Response) {
  const id = req.params.id;
  const verificationCode = req.params.verificationCode;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("user id is not valid");
  }
  // find the user by id
  const user = await findUserById(id);

  if (!user) {
    return res.status(204).send("Could not verify the user");
  }

  // check to see they are already verified
  if (user.verified) {
    return res.status(304).send("User is already verified");
  }

  // check to see if the verification code matches
  if (user.verificationCode === verificationCode) {
    user.verified = true;
    await user.save();
    return res.status(201).send("User successfully verified");
  }

  return res.send("Could not verify the user");
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const message = "if user with that email is registered, you will receive a reset password email";
  const { email } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    log.debug(`User with email ${email} does not exist`);
    return res.send(message);
  }
  if (!user.verified) {
    return res.status(304).send("User is not verified");
  }
  const passwordResetCode = nanoid();
  user.passwordResetCode = passwordResetCode;
  await user.save();
  await sendEmail({
    from: "khaled88ebdelli@gmail.com",
    to: user.email,
    subject: "Reset your password",
    text: `Password reset code ${user.passwordResetCode}\n Id: ${user._id}`
  });
  log.debug(`Password reset email sent to ${email}`);
  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordSchema["params"], {}, ResetPasswordSchema["body"]>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;
  const { password } = req.body;
  const user = await findUserById(id);
  if (!user || !user.passwordResetCode || user.passwordResetCode !== passwordResetCode) {
    return res.status(400).send("Could not reset user password");
  }
  user.passwordResetCode = null;
  user.password = password;
  await user.save();
  return res.send("Successfully updates password");
}

export async function getCurrentUser(req: Request, res: Response) {
  return res.send(res.locals.user);
}