const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Runs the python image_processor.py to overlay brand logo and product details.
 * @param {string} inputPath - Absolute or relative path to the input raw image
 * @param {string} filename - Filename to save the output as
 * @param {string} medicineName - Name of the medicine
 * @param {number} mrp - MRP of the medicine
 * @param {number} b2bPrice - B2B price of the medicine
 * @returns {Promise<string>} - The web-accessible URL path or file path of the processed image
 */
function processProductImage(inputPath, filename, medicineName, mrp, b2bPrice) {
  return new Promise((resolve, reject) => {
    const outputFilename = `watermarked_${Date.now()}_${filename}`;
    const outputPath = path.join(__dirname, '..', '..', 'public', 'processed', outputFilename);
    const scriptPath = path.join(__dirname, '..', 'image_processor.py');
    
    // Resolve absolute paths
    const absoluteInputPath = path.resolve(inputPath);
    const absoluteOutputPath = path.resolve(outputPath);

    // Ensure directory exists
    const dir = path.dirname(absoluteOutputPath);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    // Call python script
    // Note: python command can be 'python' or 'python3'. We checked earlier and 'python' works.
    const pythonProcess = spawn('python', [
      scriptPath,
      absoluteInputPath,
      absoluteOutputPath,
      medicineName,
      mrp.toString(),
      b2bPrice.toString()
    ]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Return relative path for web access: e.g. /processed/watermarked_xyz.jpg
        resolve(`/processed/${outputFilename}`);
      } else {
        console.error(`Python script exited with code ${code}. Error: ${stderrData}`);
        reject(new Error(`Image processing failed: ${stderrData || 'Unknown error'}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      reject(err);
    });
  });
}

module.exports = {
  processProductImage
};
