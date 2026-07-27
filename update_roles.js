const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace role checks in API routes
  content = content.replace(/role !== "ADMIN" && role !== "INSTRUCTOR"/g, '!["ADMIN", "SUPER_ADMIN", "INSTRUCTOR"].includes(role)');
  content = content.replace(/\(session\.user as any\)\.role !== "ADMIN"/g, '!["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)');
  
  // Replace role checks in proxy.ts
  content = content.replace(/token\?\.role !== 'ADMIN'/g, '!["ADMIN", "SUPER_ADMIN"].includes(token?.role)');
  content = content.replace(/token\.role !== 'ADMIN'/g, '!["ADMIN", "SUPER_ADMIN"].includes(token.role)');
  
  // UI checks
  content = content.replace(/\(session\.user as any\)\.role === 'ADMIN'/g, '["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)');
  content = content.replace(/profile\.role === 'ADMIN'/g, '["ADMIN", "SUPER_ADMIN"].includes(profile.role)');
  content = content.replace(/user\.role === 'ADMIN'/g, '["ADMIN", "SUPER_ADMIN"].includes(user.role)');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
