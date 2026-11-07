const installer = require('electron-installer-debian').default;
const path = require('path');
const pkg = require('./package.json');

const options = {
  src: path.join(__dirname, 'dist/tradingjournal-linux-x64'),
  dest: path.join(__dirname, 'dist/installers'),
  arch: 'amd64',
  name: 'tradingjournal',
  productName: 'Trading Journal',
  genericName: 'Trading Journal',
  version: pkg.version,
  section: 'utils',
  priority: 'optional',
  maintainer: 'Trading Journal <noreply@example.com>',
  description: 'Persönliches Trading-Journal für Profits und Losses mit Kalenderansicht',
  productDescription: 'Ein lokales Trading-Journal zum Erfassen von Trades, P/L-Tracking und einer Kalenderansicht von Gewinn- und Verlusttagen.',
  categories: ['Office', 'Finance'],
  icon: path.join(__dirname, 'app/icon.png'),
};

console.log('Building .deb package...');
installer(options)
  .then(() => console.log('.deb build done'))
  .catch((err) => {
    console.error('Error building .deb:', err);
    process.exit(1);
  });
