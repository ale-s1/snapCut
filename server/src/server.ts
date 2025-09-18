import app from "./app";
import config from "./config/environment.config";

app.listen(config.port, () => {
	console.log(`Server running on port ${config.port}`);
});
