import './style';
import App from './components/app';

if (typeof window !== "undefined") {
  const WebFont = require('webfontloader');
  WebFont.load({
    google: {
      families: ['Lekton:400,700']
    }
  });
}

export default App;
