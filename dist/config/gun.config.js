import Gun from "gun";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Helper to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure the directory exists
const databaseDir = path.resolve(__dirname, "../database/connection");
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
}
// Set the full path to the data file
const dataFile = path.join(databaseDir, "data.json");
// Initialize GunDB with the file path
export const gun = Gun({
    file: dataFile, // Specify the full path to the data file
    localStorage: false // Optional, disables browser localStorage use (useful for Node environments)
});
export default gun;
