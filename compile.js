const solc = require('solc');
const path = require('path');
const fs = require('fs');

let filePath = path.join(__dirname, 'constructs', 'funding.sol');
let cachePath = path.join(__dirname, 'constructs', 'funding_cache.json');

let compile;
let isReadCache = true;
if (isReadCache) {
    let str = fs.readFileSync(cachePath, 'utf-8');
    compile = JSON.parse(str);
} else {
    let content = fs.readFileSync(filePath, 'utf-8');
    compile = solc.compile(content, 1);
    fs.writeFileSync(cachePath,JSON.stringify(compile));
}

module.exports = {
    FundingFactory:compile.contracts[':FundingFactory'],
    Funding:compile.contracts[':Funding']

}
