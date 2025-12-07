const fs = require('fs');
const data = JSON.parse(fs.readFileSync('memory/feature_list.json', 'utf8'));

// Features to mark as passing: F26, F31, F32, F33, F34
const featureIds = [26, 31, 32, 33, 34];

data.features.forEach(f => {
  if (featureIds.includes(f.id) && !f.passes) {
    f.passes = true;
    f.test_passes_after = true;
    console.log('Marked feature', f.id, 'as passing:', f.name);
  }
});

fs.writeFileSync('memory/feature_list.json', JSON.stringify(data, null, 2));
console.log('Updated feature_list.json');
