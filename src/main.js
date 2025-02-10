import { config } from "dotenv";

const main = async () => {
    config();
    const start = await import("./server/app.js");
    start.default();
};

main().catch(
    (err) => {
        console.error("unable to start server", err);
        process.exit(1);
    }
);