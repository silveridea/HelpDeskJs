# HelpDeskJS

Simple helpdesk Node.js website for user subscription management and ticket creation with groove integration at the backend.

Features
--------

- **Local Authentication** using Email and Password
- **OAuth 2.0 Authentication** via Google
- Contact Form
  - Sending email to admin
- Groove integration
  - Create a new ticket
  - View ticket messages
  - Add ticket message
- Stripe credit card payment integration
- Subscription payment management
- Allow/disallow creation of tickets if invoice is not paid
- User account and subscription management
  - Welcome email to user
  - Admin notification on every new user
  - Gravatar
  - Profile details
  - Change password
  - Forgot password
  - Reset password
  - Link multiple OAuth logins to one account
  - CSRF protection
- MVC Project Structure
- Express
- EJS forms (with master layout)
- Sass stylesheets (auto-compiled via middleware)
- Bootstrap 3

Prerequisites
-------------

- [Groove](https://www.groovehq.com) team subscription or trial account
- [Stripe](https://stripe.com/) subscription or dev subscription
- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js 6.0+](http://nodejs.org)
- SMTP Connection


Installation
------------
```js
npm install helpdeskjs --save
```

Usage
-----
You will need to edit **.env.example** file and set your keys.

MONTHLY_PRICE is the price per month for your service in USD.

See obtaining API keys section below.

start your mongodb
```js
npm start
```
  
You can now browse to http://localhost:3000
  
  
  
  
## Obtaining API keys

Groove
------
- Sign up with https://www.groovehq.com/
- Go to Settings->API
- Copy the Private Token and paste it to `.env` file to GROOVEHQ_ACCESS_TOKEN=
- Put the email you are using with groove in `.env` file to GROOVE_AGENT_EMAIL=

Stripe
------
- Sign up with http://stripe.com
- Click on your profile and click on Account Settings 
- Click on API Keys
- Copy the keys into `.env` file to STRIPE_SKEY, STRIPE_PKEY

Google
------
- Visit Google Cloud Console https://console.cloud.google.com/
- Click on the Create Project button - Enter your project name, click on Create button 
- Then click on API Manager in the sidebar -> Enable API
- Uder Social APIs click on Google+ API, then click Enable API
- On API Manager in the sidebar click Credentials
- Click on Create new Client ID button 
- Select Web Application and click on Configure Consent Screen 
- Fill out the required fields then click on Save 
- In the Create Client ID modal dialog: 
  - Application Type: Web Application 
  - Authorized Javascript origins: http://localhost:3000 
  - Authorized redirect URI: http://localhost:3000/auth/google/callback 
  - Click on Create Client ID button 
  - Copy and paste Client ID and Client secret keys into `.env` file GOOGLE_ID,GOOGLE_SECRET
Note: When you ready to deploy to production don't forget to add your new url to Authorized Javascript origins and Authorized redirect URI, e.g. http://myapp.herokuapp.com and http://myapp.herokuapp.com/auth/google/callback respectively.

#### Future work
* Add guide how to publish to Heroku
* Enable payment with PayPal
* Create a job to generate new invoice every month, send a notification to the user, disable the account if not paid
* Create a real shopping cart

Your feedback is important

[by silveridea](http://www.silveridea.net/?utm_source=github&utm_campaign=link1)