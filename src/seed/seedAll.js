const { execSync } = require('child_process');

function runSeedScript(script) {
  try {
    console.log(`Running: ${script}`);
    execSync(`node ${script}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running ${script}:`, error.message);
  }
}

runSeedScript('src/seed/seedBusiness.js');
runSeedScript('src/seed/seedData.js');
runSeedScript('src/seed/seedReferral.js');

console.log('All seed scripts executed.'); 