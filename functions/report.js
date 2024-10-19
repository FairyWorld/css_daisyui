import zlib from 'zlib';
import { promises as fs } from 'fs';
import path from 'path';

async function processFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const stats = await fs.stat(filePath);
    const brotliSize = await compressFile(fileContent, zlib.brotliCompress);

    const cssVariables = (fileContent.match(/--tw[\w-]+:/g) || []).length;

    return {
      file: filePath,
      selectors: (fileContent.match(/(?:[^}]+{|@\w+\s*[^;{}]+(?:;|\{))/g) || []).length,
      lines: fileContent.split('\n').length,
      vars: cssVariables,
      raw: stats.size / 1000,
      brotli: brotliSize / 1000,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    return null;
  }
}

async function processDirectory(dir) {
  try {
    const files = await fs.readdir(dir);
    const cssFiles = files.filter(file => file.endsWith('.css'));
    return Promise.all(cssFiles.map(file => processFile(path.join(dir, file))));
  } catch (error) {
    console.error(`Error accessing ${dir}: ${error.message}`);
    return [];
  }
}

async function compressFile(content, compressFunc) {
  return new Promise(resolve => compressFunc(content, (_, result) => resolve(result.length)));
}

export const report = async (directories) => {
  const report = await Promise.all(
    directories.map(async (dir) => {
      try {
        const stats = await fs.stat(dir);
        return stats.isDirectory() ? processDirectory(dir) : processFile(dir);
      } catch (error) {
        console.error(`Error accessing ${dir}: ${error.message}`);
        return null;
      }
    })
  );

  const flatReport = report.flat().filter(Boolean);

  if (flatReport.length === 0) {
    console.error("No files were successfully processed.");
    return;
  }

  console.table(flatReport, ['file', 'selectors', 'lines', 'vars', 'raw', 'brotli']);
}
