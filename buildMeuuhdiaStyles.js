import fs from "fs";
import { execSync } from "child_process";

execSync('sass --no-source-map --style=compressed scss/meuuhdia.scss:meuuhdia.css');

const cssContent = fs.readFileSync('meuuhdia.css', 'utf-8');
const exportFile = `export const styles = ${JSON.stringify(cssContent)};\n`;

fs.writeFileSync('meuuhdia-css.js', exportFile);