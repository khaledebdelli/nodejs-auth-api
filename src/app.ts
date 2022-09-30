require("dotenv").config();
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import config from "config";
import { connectToDb } from "./utils/connectToDb";
import router from './routes'
import deserializeUser from './middleware/deserializeUser';

const app = express();

app.use(express.json())

app.use(deserializeUser)

app.use(router)


const port = config.get("port");

app.listen(port, () => {
  console.log("listening on port " + port);
  connectToDb()
});
