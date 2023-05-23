import app from "./app";
import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
  console.log("Error : ", err.message);
  console.log("Shutting down the server due to Uncaught Exception");
  process.exit(1);
});

// config
dotenv.config({ path: "./.env" });

//Connecting Database
// import ConnectDatabase from "./config/database";
import { Server } from "http";

// ConnectDatabase();

const PORT = process.env.DEV ? process.env.PORT_DEV : process.env.PORT_PRO;
const server = app.listen(PORT, () => {
  console.log("server is working on http://localhost:", PORT);
});

// UnHandled Promise Rejection

process.on("unhandledRejection", (err: any) => {
  console.log("Error : ", err.message);
  console.log("Shutting down the server due to Unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
