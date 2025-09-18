import cors from "cors";
import Express from "express";
import corsOptions from "./config/cors.option";
import errorHandler from "./middleware/error-handler";
import videoRoute from "./routes/video.router";

const app = Express();

app.use(Express.json());
app.use(cors(corsOptions));
app.use("/api/public", videoRoute);

app.use(errorHandler);

export default app;
