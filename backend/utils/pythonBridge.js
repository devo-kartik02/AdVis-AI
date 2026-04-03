const { spawn } = require('child_process');
const path = require('path');

exports.runAIEngine = (filePath, category) => {
    return new Promise((resolve, reject) => {
        // 🎯 TARGETING THE ROOT VENV
        const pythonPath = "D:\\Visibility-Analysis-Project\\venv\\Scripts\\python.exe";
        const scriptPath = path.resolve(__dirname, '../../ai_engine/processor.py');

        const process = spawn(pythonPath, [scriptPath, filePath, category]);

        let output = "";
        let errorOutput = "";

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python Error (Code ${code}): ${errorOutput}`));
            }
            try {
                // Find the first '{' and last '}' to handle potential logging noise
                const jsonStart = output.indexOf('{');
                const jsonEnd = output.lastIndexOf('}');
                const jsonRaw = output.substring(jsonStart, jsonEnd + 1);
                
                const jsonResult = JSON.parse(jsonRaw);
                resolve(jsonResult);
            } catch (e) {
                reject(new Error("Failed to parse Python JSON. Raw Output: " + output));
            }
        });
    });
};