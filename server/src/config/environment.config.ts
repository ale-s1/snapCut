import dovenv from "dotenv";

dovenv.config();

interface Config {
	port: number;
	nodeEnv: string;
	audience: string;
	issuer_base_url: string;
}

const config: Config = {
	port: Number(process.env.PORT) || 3000,
	nodeEnv: process.env.NODE_ENV || "development",
	audience: process.env.AUDIENCE || "",
	issuer_base_url: process.env.ISSUER_BASE_URL || "",
};

export default config;
