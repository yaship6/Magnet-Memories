import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URL = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = ['https://www.googleapis.com/auth/gmail.send'];

// Create a local server to handle the callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/oauth2callback') {
    const code = parsedUrl.query.code;
    const error = parsedUrl.query.error;

    if (error) {
      res.end(`Error: ${error}`);
      process.exit(1);
    }

    try {
      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('\n✅ SUCCESS! Here are your tokens:\n');
      console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
      console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      
      // Optional: Save to .env file
      const envPath = path.join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Update or add the credentials
      envContent = envContent.replace(
        /GMAIL_REFRESH_TOKEN=.*/,
        `GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`
      );
      
      if (!envContent.includes('GMAIL_CLIENT_ID')) {
        envContent += `\nGMAIL_CLIENT_ID=${CLIENT_ID}`;
      } else {
        envContent = envContent.replace(
          /GMAIL_CLIENT_ID=.*/,
          `GMAIL_CLIENT_ID=${CLIENT_ID}`
        );
      }

      if (!envContent.includes('GMAIL_CLIENT_SECRET')) {
        envContent += `\nGMAIL_CLIENT_SECRET=${CLIENT_SECRET}`;
      } else {
        envContent = envContent.replace(
          /GMAIL_CLIENT_SECRET=.*/,
          `GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`
        );
      }

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file with refresh token!');

      res.end('✅ Authorization successful! You can close this window and check your .env file.');
      server.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      res.end(`Error: ${error.message}`);
      server.close();
      process.exit(1);
    }
  }
});

server.listen(3000, () => {
  console.log('🔐 Authorization server started on http://localhost:3000\n');
  
  // Generate and open authorization URL
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force consent screen to get refresh token
  });

  console.log('📂 Open this URL in your browser:\n');
  console.log(authorizeUrl + '\n');
  console.log('After authorizing, you will be redirected and the tokens will be saved.\n');
});