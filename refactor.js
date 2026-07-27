const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function refactorFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  // Helper function to append dark: variants while keeping prefixes (like hover:, focus:)
  function appendDark(str, regex, lightClass, darkClass) {
    return str.replace(regex, (match, prefix) => {
      let p = prefix || '';
      return `${p}${lightClass} dark:${p}${darkClass}`;
    });
  }

  // 1. Page Container (App.jsx is mostly handled)
  
  // 2. Cards / Panels
  content = content.replace(/(?<!dark:)bg-slate-900\/80(.*?)border-slate-800/g, 'bg-white dark:bg-slate-900$1border-slate-200 dark:border-slate-800');
  content = content.replace(/(?<!dark:)bg-slate-900(.*?)border-slate-800/g, 'bg-white dark:bg-slate-900$1border-slate-200 dark:border-slate-800');
  content = content.replace(/(?<!dark:)bg-slate-900\/60(.*?)border-slate-800/g, 'bg-white/60 dark:bg-slate-900/60$1border-slate-200 dark:border-slate-800');
  content = content.replace(/(?<!dark:)bg-slate-950\/60(.*?)border-slate-800/g, 'bg-white dark:bg-slate-900$1border-slate-200 dark:border-slate-800');
  
  // 3. Form Inputs
  content = content.replace(/(?<!dark:)bg-slate-950(.*?)border-slate-700\/60/g, 'bg-white dark:bg-slate-800$1border-slate-300 dark:border-slate-700');
  content = content.replace(/(?<!dark:)bg-slate-950(.*?)border-slate-700/g, 'bg-white dark:bg-slate-800$1border-slate-300 dark:border-slate-700');
  content = content.replace(/(?<!dark:)bg-slate-950(.*?)border-slate-800/g, 'bg-white dark:bg-slate-800$1border-slate-300 dark:border-slate-700');
  
  // 4. Tables & Overlays
  content = content.replace(/(?<!dark:)bg-slate-950\/80(.*?)border-b border-slate-800/g, 'bg-slate-100 dark:bg-slate-800/60$1border-b border-slate-200 dark:border-slate-800');
  content = content.replace(/(hover:)?bg-slate-800\/40(?! dark:)/g, (m, p) => p ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50 dark:bg-slate-800/40');
  content = content.replace(/(?<!dark:)divide-slate-800\/60/g, 'divide-slate-200 dark:divide-slate-800/60');
  content = content.replace(/(?<!dark:)divide-slate-800(?! \/)/g, 'divide-slate-200 dark:divide-slate-800');
  content = content.replace(/(?<!dark:)bg-slate-950\/80 backdrop-blur/g, 'bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur'); // Modals

  // 5. Text colors with prefix support
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?text-slate-100/g, 'text-slate-900', 'text-slate-100');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?text-white/g, 'text-slate-900', 'text-white');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?text-slate-300/g, 'text-slate-600', 'text-slate-300');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?text-slate-400/g, 'text-slate-500', 'text-slate-400');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?text-slate-200/g, 'text-slate-700', 'text-slate-200');

  // 6. Generic Backgrounds missing dark (if not matched above)
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?bg-slate-900(?![\/\-])/g, 'bg-white', 'bg-slate-900');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?bg-slate-950(?![\/\-])/g, 'bg-white', 'bg-slate-950');
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?bg-slate-800(?![\/\-])/g, 'bg-slate-100', 'bg-slate-800');

  // Cleanup potential double replacements
  content = content.replace(/bg-white dark:bg-white dark:bg-slate-900/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/bg-white dark:bg-white dark:bg-slate-950/g, 'bg-white dark:bg-slate-950');
  
  // Any remaining borders
  content = appendDark(content, /(?<!dark:)(hover:|focus:|group-hover:)?border-slate-800(?![\/\-])/g, 'border-slate-200', 'border-slate-800');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated', filePath);
  }
}

walkDir(srcDir, refactorFile);
