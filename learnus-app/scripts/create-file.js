#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const type = args[0]; // 'value-object', 'entity', 'use-case'
const name = args[1];

if (!type || !name) {
  console.log('Usage: node scripts/create-file.js <type> <name>');
  console.log('Types: value-object, entity, use-case');
  process.exit(1);
}

const templates = {
  'value-object': 'templates/ValueObject.template.ts',
  'entity': 'templates/Entity.template.ts',
  'use-case': 'templates/UseCase.template.ts'
};

const templatePath = templates[type];
if (!templatePath) {
  console.log('Invalid type. Available types: value-object, entity, use-case');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
const className = name.charAt(0).toUpperCase() + name.slice(1);
const fileName = `${className}.ts`;

// Replace placeholders
const content = template
  .replace(/\{\{CLASS_NAME\}\}/g, className)
  .replace(/\{\{ENTITY_NAME\}\}/g, className)
  .replace(/\{\{USE_CASE_NAME\}\}/g, className)
  .replace(/\{\{TYPE\}\}/g, 'string') // Default type
  .replace(/\{\{REPOSITORY_INTERFACE\}\}/g, `I${className}Repository`)
  .replace(/\{\{DTO_INTERFACE\}\}/g, `${className}Dto`)
  .replace(/\{\{RESPONSE_TYPE\}\}/g, `${className}Response`)
  .replace(/\{\{repositoryName\}\}/g, `${name}Repository`);

// Determine target directory
let targetDir;
switch (type) {
  case 'value-object':
    targetDir = 'src/domain/value-objects';
    break;
  case 'entity':
    targetDir = 'src/domain/entities';
    break;
  case 'use-case':
    targetDir = 'src/application/use-cases';
    break;
}

const targetPath = path.join(targetDir, fileName);

// Create directory if it doesn't exist
fs.mkdirSync(targetDir, { recursive: true });

// Write file
fs.writeFileSync(targetPath, content);

console.log(`✅ Created ${type}: ${targetPath}`);
console.log('📝 Remember to:');
console.log('  1. Update the template placeholders');
console.log('  2. Write tests');
console.log('  3. Run npm run check-quick');
