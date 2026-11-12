# Commonly

Good things grow together.

Commonly is a community-sharing platform designed to make cooperation easier. It connects people who have something to offer with people who need something, encouraging resource sharing, mutual support, and stronger communities.

The platform provides a centralized space where users can publish offers and requests, manage their profiles, and discover opportunities to help one another.

Live Application: https://commonly-qwaf.onrender.com

Features

Community Sharing
Publish offers to share resources, skills, or assistance.
Create requests to communicate what you need.
Browse community posts.
Edit and delete your own posts.
Organize posts using categories and locations.
Manage post information, including titles and descriptions.
User Accounts
User registration and login.
Password hashing for account security.
Session-based authentication.
Individual user profiles.
Profile information management.
Commonly Plus
Commonly Plus is the premium membership experience, providing additional capabilities for active community members.

Plus members receive:

Unlimited offer creation.
Unlimited request creation.
Access to GoodOne AI.
GoodOne AI
GoodOne AI is an integrated AI-powered writing assistant that helps users create better community posts.

It can assist with:

Generating post titles.
Writing descriptions.
Improving the presentation of offers and requests.
Making post creation easier and faster.
The AI functionality is powered by Google's Gemini API.

Membership and Payments
PayPal integration for purchasing Commonly Plus.
Server-side payment order creation and capture.
Payment verification before membership activation.
Membership status and expiration tracking.
Technology Stack

Component| Technology Frontend| HTML, CSS, JavaScript Backend| Node.js, Express.js Database| MySQL-compatible MariaDB / TiDB Database Driver| mysql2 Authentication| Session-based authentication Password Security| bcryptjs AI Integration| Google Gemini API Payment Integration| PayPal

Project Structure

Commonly/ │ ├── server.js ├── package.json ├── package-lock.json ├── database.sql ├── README.md │ ├── index.html ├── dashboard.html │ └── public/ ├── app.js ├── dashboard.js ├── dashboard.css └── style.css

Installation

Requirements

Node.js
npm
A compatible MySQL database service
Required API credentials for enabled integrations
Get the project
Clone the repository:

git clone https://github.com/web9211/Commonly-community-site.git cd Commonly-community-site

Install dependencies
npm install

Configure the application
Configure the database connection and integration credentials using the environment configuration expected by the application.

Required integrations include:

Database connection
Google Gemini API
PayPal API
Keep credentials private. Do not publish API keys, database passwords, or payment secrets.

Start the application
npm start

The application will run on the configured port. For a standard local setup, open:

http://localhost:3000

Demo Account

A shared demonstration account is provided for evaluation.

Field| Details Email| user123@gmail.com Password| 1234567890 Membership| Commonly Plus

Note: This account is intended exclusively for demonstration and testing. Judges can use it to explore Plus features without purchasing a membership.

Premium Membership

Commonly Plus is available through the application's PayPal payment integration.

The membership system tracks payment status and membership validity. Premium access is granted after successful server-side payment verification.

Security

Commonly incorporates several security-related practices:

Password hashing using bcryptjs.
Session-based user authentication.
Server-side authorization for user-specific operations.
Server-side payment verification.
Environment-based configuration for deployment credentials.
Deployment

Commonly is deployed as a web application and is accessible at:

https://commonly-qwaf.onrender.com

Vision

Commonly is built around a simple idea: communities become stronger when people help one another.

By bringing offers and requests together in one platform, Commonly aims to make cooperation more accessible, organized, and practical.

Good things grow together.

License

All rights reserved unless otherwise specified by the repository owner.
