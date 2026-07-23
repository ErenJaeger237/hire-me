

async function check() {
  try {
    const url = 'https://hire-me-snowy-eta.vercel.app/';
    const res = await fetch(url);
    const html = await res.text();
    
    // Find the JS chunk URL
    const match = html.match(/<script type="module" crossorigin src="(.*?)"/);
    if (!match) {
      console.log('No JS bundle found in HTML');
      return;
    }
    
    let jsUrl = match[1];
    if (jsUrl.startsWith('/')) {
      jsUrl = url + jsUrl.substring(1);
    } else {
      jsUrl = url + jsUrl;
    }
    
    console.log('Fetching JS:', jsUrl);
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    
    console.log('Contains localhost:5000 ?', jsText.includes('localhost:5000'));
    console.log('Contains onrender.com ?', jsText.includes('onrender.com'));
    
  } catch (err) {
    console.error(err);
  }
}

check();
