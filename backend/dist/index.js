"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Initializations
let app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// Configurations
dotenv_1.default.config({
    path: path_1.default.join(__dirname, "./config.env")
});
// routes
const codeRunner_1 = __importDefault(require("./routes/code/codeRunner"));
app.use("/code", codeRunner_1.default);
const auth_1 = __importDefault(require("./routes/auth/auth"));
app.use("/auth", auth_1.default);
const candidate_1 = __importDefault(require("./routes/candi/candidate"));
app.use("/candidate", candidate_1.default);
const organisation_1 = __importDefault(require("./routes/orga/organisation"));
app.use("/organisation", organisation_1.default);
// connecting to mongodb
mongoose_1.default.connect(process.env.MONGO_URL);
const db = mongoose_1.default.connection;
db.on('error', () => console.log("connection error"));
db.once('open', () => {
    console.log("We are connected!");
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, "localhost", () => {
    console.log("Started at ", PORT);
});
