
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
app_1.app.listen(config_1.env.PORT, () => {
    logger_1.logger.info(`Server running on http://localhost:${config_1.env.PORT}`);
});
