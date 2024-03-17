import serverless from "serverless-http";
import express from "express";
const app = express();
import userRouter from "./src/routes/userRouter.js";

app.use(express.json());
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/path", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use("/users", userRouter);



app.get("/data/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  return res.status(200).json({
    message: "Hello from data! + id: " + id,
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
