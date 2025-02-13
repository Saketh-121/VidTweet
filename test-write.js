import fs from 'fs';
import path from 'path'
// const path = require('path');

const filePath = path.join('public', 'temp', 'test.txt');

fs.writeFile(filePath, 'Test file content', (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File written successfully!');
    }
});
