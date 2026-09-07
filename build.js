const fs = require('fs-extra');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

async function build() {
    console.log('Starting obfuscation build process...');
    const distDir = path.join(__dirname, 'dist');

    // 1. Clean the dist directory
    console.log('Cleaning dist folder...');
    await fs.emptyDir(distDir);

    // 2. Copy static files
    console.log('Copying static assets...');
    await fs.copy(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
    await fs.copy(path.join(__dirname, 'style.css'), path.join(distDir, 'style.css'));
    await fs.copy(path.join(__dirname, 'logos.js'), path.join(distDir, 'logos.js'));
    await fs.copy(path.join(__dirname, 'qrcode.min.js'), path.join(distDir, 'qrcode.min.js'));
    await fs.copy(path.join(__dirname, 'school_logos'), path.join(distDir, 'school_logos'));

    // 3. Obfuscate app.js
    console.log('Obfuscating app.js...');
    const appJsContent = await fs.readFile(path.join(__dirname, 'app.js'), 'utf8');

    const obfuscationResult = JavaScriptObfuscator.obfuscate(appJsContent, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 1,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    });

    await fs.writeFile(path.join(distDir, 'app.js'), obfuscationResult.getObfuscatedCode());

    console.log('Build completed successfully! The "dist" folder is ready for deployment.');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
