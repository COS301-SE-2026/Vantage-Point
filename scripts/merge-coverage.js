const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, '.github', 'docs');
const outFile = path.join(outDir, 'coverage-summary.md');

// Coverage threshold (Project: 90%)
// Any file frontend or backend below is called out in its own table in the summary report.
const THRESHOLD = Number(90);

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const now = new Date().toISOString();

let fe = null, be = null;
let feFiles = null, beFiles = null;

try {
    const feJson = JSON.parse(
        fs.readFileSync(path.join(root, 'frontend/coverage/coverage-summary.json'), 'utf8')
    );
    fe = feJson.total;
    feFiles = Object.entries(feJson)
    .filter(([key]) => key !== 'total')
    .map(([file, data]) => ({
        file: path.relative(root, path.resolve(root, 'frontend', file)).replace(/\\/g, '/'),
        pct: data.lines.pct,
    }))
    .filter((f) => f.pct < THRESHOLD)
    .sort((a, b) => a.pct - b.pct);
} catch {
    console.warn('Frontend coverage summary not found');
}
 
try {
    const beJson = JSON.parse(fs.readFileSync(path.join(root, 'backend/coverage.json'), 'utf8'));
    be = beJson.totals;
    beFiles = Object.entries(beJson.files || {})
    .map(([file, data]) => ({ file, pct: data.summary.percent_covered }))
    .filter((f) => f.pct < THRESHOLD)
    .sort((a, b) => a.pct - b.pct);
} catch {
    console.warn('Backend coverage json not found');
}
 
function lowCoverageTable(files) {
    if (!files || files.length === 0) {
        return `_No files below ${THRESHOLD}%._\n\n`;
    }
    let t = `| File | Coverage |\n|---|---|\n`;
    for (const f of files) {
        t += `| ${f.file} | ${f.pct.toFixed(2)}% |\n`;
    }
    return t + `\n`;
}
 
let md = `# Test Coverage Summary\n\n_Generated: ${now}_\n\n`;
 
md += `## Frontend (Vitest)\n\n`;
if (fe) 
{
    md += `| Metric | Coverage |\n|---|---|\n`;
    md += `| Lines | ${fe.lines.pct}% |\n`;
    md += `| Statements | ${fe.statements.pct}% |\n`;
    md += `| Functions | ${fe.functions.pct}% |\n`;
    md += `| Branches | ${fe.branches.pct}% |\n\n`;
    md += `### Files below ${THRESHOLD}% (line coverage)\n\n`;
    md += lowCoverageTable(feFiles);
} else {
    md += `_No frontend coverage data found._\n\n`;
}
 
md += `## Backend (Pytest)\n\n`;
if (be) {
    md += `| Metric | Value |\n|---|---|\n`;
    md += `| Coverage | ${be.percent_covered.toFixed(2)}% |\n`;
    md += `| Statements | ${be.num_statements} |\n`;
    md += `| Missing | ${be.missing_lines} |\n\n`;
    md += `### Files below ${THRESHOLD}%\n\n`;
    md += lowCoverageTable(beFiles);
} else {
    md += `_No backend coverage data found._\n\n`;
}
 
fs.writeFileSync(outFile, md);
console.log(`Wrote ${outFile}`);