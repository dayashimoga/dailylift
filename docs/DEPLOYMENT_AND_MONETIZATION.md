# DailyLift: Deployment, Monetization, and Automation Guide

This document serves as the ultimate reference for configuring the infrastructure, revenue streams, and automated social media presence of the DailyLift application. If you are setting up the project from scratch or transferring ownership, follow these steps exactly.

---

## 🏗️ 1. Hosting & Domain Setup

### 1.1 Purchasing the Domain
1. Purchase a domain name from a registrar like **Porkbun**, Namecheap, or GoDaddy (e.g., `quickutils.top`).
2. Do not set up DNS records at the registrar yet. We will transfer DNS management entirely to Netlify.

### 1.2 Deploying on Netlify
1. Log into [Netlify](https://app.netlify.com/) and click **Add new site** -> **Import an existing project**.
2. Connect your GitHub account and select your `dailylift` repository.
3. Use the following build settings:
   - **Base directory:** *(leave blank)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy Site**. Netlify will build the HTML and publish it to a temporary `.netlify.app` URL.

### 1.3 Configuring Custom Domain & DNS
1. In the Netlify dashboard for your site, go to **Domain management**.
2. Click **Add custom domain** and type your purchased domain (`quickutils.top`).
3. Netlify will prompt you to set up Netlify DNS. Proceed through the wizard to generate the 4 custom Name Servers (e.g., `dns1.p01.nsone.net`).
4. Log into your domain registrar (Porkbun) and locate the **Name Servers (NS)** settings for your domain.
5. Replace the default name servers with the 4 Netlify name servers.
6. **Wait up to 24 hours.** Global DNS propagation takes time.
7. Once propagated, Netlify will automatically provision a free Let's Encrypt **SSL Certificate**, changing your site from "Not Secure" to a secure padlock.

---

## 💰 2. Monetization Setup

### 2.1 Amazon Associates (Affiliate Links)
We monetize the recommended books section by earning a commission on clicks and purchases.
1. Sign up for [Amazon Associates](https://affiliate-program.amazon.com/).
2. Fill out your tax and payment information.
3. Locate your **Store ID / Tracking ID** (e.g., `quickutils-21`).
4. In your codebase, open `src/index.html` and locate the book recommendations section.
5. Search Amazon for the books (*Atomic Habits*, *Deep Work*, etc.), generate affiliate links using the Amazon SiteStripe toolbar, and replace the `href=""` attributes in the HTML.

### 2.2 Google AdSense (Banner Ads)
We earn passive revenue based on ad impressions and clicks.
1. Go to [Google AdSense](https://adsense.google.com/start/) and sign in with your Google account.
2. Add your custom domain (`https://quickutils.top`) under the "Sites" tab.
3. Google will ask you to verify ownership. You can do this by dropping a `<meta name="google-adsense-account">` tag into the `<head>` of your `src/index.html`.
4. Locate your **Publisher ID** (e.g., `ca-pub-1234567890`).
5. In `src/index.html`, uncomment the Google AdSense script in the `<head>` and replace `YOUR_PUBLISHER_ID` with your actual ID.
6. AdSense placeholders (`<ins class="adsbygoogle">`) exist throughout the layout. They will remain blank until Google officially approves your site (takes 3 to 14 days).

---

## 🤖 3. Social Media Automation (Mastodon / Fediverse)

Our project uses GitHub Actions to randomly select a quote from `data/quotes-collection.json` and publish it to Mastodon every midnight UTC. We use Mastodon because its API is 100% free, developer-friendly, and connects to millions of users on the federated social web without arbitrary paywalls.

### Step 1: Create a Mastodon Account
1. Go to [mastodon.social](https://mastodon.social) (or any other Mastodon instance) and create a free account for your DailyLift brand.
2. Confirm your email and log in.

### Step 2: Generate an API Access Token
1. In Mastodon, click on **Preferences** (the gear icon).
2. On the left sidebar, click **Development**.
3. Click the **New Application** button.
4. Give your app a name (e.g., "DailyLift Auto-Poster").
5. In the **Scopes** section, you only need `write:statuses` (you can uncheck everything else, or leave it default).
6. Click **Submit** at the bottom.
7. Click on your newly created application name.
8. Look for the **Your access token** string. Copy it!

### Step 3: Add the Token to GitHub
1. Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
2. Create a new repository secret:
   - Name: `MASTODON_ACCESS_TOKEN`
   - Secret: *(Paste your token here)*
3. Create a second repository secret:
   - Name: `MASTODON_INSTANCE_URL`
   - Secret: `mastodon.social` *(Change this if you registered on a different server)*

### Step 4: Verify Automation
Your `post-social.js` script is natively programmed to find these variables.
To test it immediately, go to your GitHub repository -> Actions tab -> **Daily Quote Update** -> **Run workflow**. If successful, the GitHub runner will show a `200 Success` code, and the quote will instantly appear on your Mastodon profile.

---

## 📈 4. Traffic Analytics (Google Analytics GA4)

To measure how much traffic your site and automated posts are generating, Google Analytics is natively integrated into your HTML.

1. Sign up for [Google Analytics](https://analytics.google.com/).
2. Create a new Property for your domain (`quickutils.top`).
3. Set up a **Web Data Stream**.
4. Once created, Google will furnish you with a **Measurement ID** (it looks like `G-XXXXXXXXXX`).
5. Open your local repository, and perform a global Find & Replace across all `.html` files in the `/src` folder.
6. Replace `G-XXXX` with your actual Measurement ID.
7. Merge and push to GitHub. Netlify will rebuild the site, and live tracking will commence immediately.
