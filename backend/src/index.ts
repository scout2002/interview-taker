import express, { NextFunction, Request, Response } from "express";
import errorHandler from "./middlewares/errorHandler";
import langraphRoutes from "./routes/langraph.route";

const app = express();

app.listen(8000, () => {
  console.log("Server is listening");
});

app.use("/v1/langraph", langraphRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
