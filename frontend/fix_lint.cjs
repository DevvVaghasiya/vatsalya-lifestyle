const fs = require('fs');
const path = require('path');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove "import React from 'react';"
  content = content.replace(/import React from 'react';\r?\n/g, '');
  
  // 2. Remove "React, " from "import React, { useState } from 'react';"
  content = content.replace(/import React,\s*{\s*/g, 'import { ');
  
  fs.writeFileSync(filePath, content, 'utf8');
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      fixFile(fullPath);
    }
  }
};

walk(path.join(__dirname, 'src'));
