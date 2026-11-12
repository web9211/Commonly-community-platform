Commonly

Good things grow together.

Commonly is a community-sharing platform designed to make cooperation easier. It connects people who have something to offer with people who need something, encouraging resource sharing, mutual support, and stronger communities.

Instead of keeping useful resources and requests disconnected, Commonly provides a centralized space where people can share offers, publish requests, manage profiles, and discover opportunities to help one another.

Live Application: https://commonly-qwaf.onrender.com

Public Source Code: https://github.com/web9211/Commonly-community-platform

---

Features

1. Community Sharing

- Publish offers to share resources, skills, or assistance.
- Create requests describing what you need.
- Browse community posts.
- Edit and delete your own posts.
- Organize posts using categories and locations.
- Add titles, descriptions, and optional location information.
- Set expiration information for posts.

2. User Accounts and Profiles

- User registration and login.
- Password hashing using "bcryptjs".
- Session-based authentication.
- Individual user profiles.
- Profile information management.
- User-specific access to posts and account features.

3. Commonly Plus

Commonly Plus is the premium membership experience for active community members.

Plus features include:

- Unlimited offer creation.
- Unlimited request creation.
- Access to GoodOne AI.

Membership status and expiration are tracked by the application.

4. GoodOne AI

GoodOne AI is an integrated AI-powered writing assistant that helps users create better community posts.

It can assist with:

- Generating post titles.
- Writing descriptions.
- Improving the presentation of offers and requests.
- Making post creation easier and faster.

The AI functionality uses Google's Gemini API.

5. PayPal Integration

Commonly integrates PayPal for Commonly Plus membership payments.

The payment system includes:

- Server-side payment order creation.
- PayPal order capture.
- Payment verification before membership activation.
- Payment records.
- Membership status and expiration tracking.

The application supports PayPal sandbox configuration for testing.

---

Technology Stack

Component| Technology
Frontend| HTML, CSS, JavaScript
Backend| Node.js, Express.js
Database| MySQL-compatible MariaDB / TiDB
Database Driver| mysql2
Authentication| Session-based authentication
Password Security| bcryptjs
AI Integration| Google Gemini API
Payment Integration| PayPal REST API

---

Project Structure

Commonly-community-platform/
│
├── server.js
├── package.json
├── package-lock.json
├── database.sql
├── .env.example
├── README.md
├── LICENSE
│
├── index.html
├── dashboard.html
│
└── public/
    ├── app.js
    ├── dashboard.js
    ├── dashboard.css
    └── style.css

---

Installation and Setup

Requirements

- Node.js 18 or later.
- npm.
- A compatible MySQL database service, such as MySQL, MariaDB, or TiDB.
- A Google Gemini API key for GoodOne AI.
- PayPal developer credentials for payment functionality.

1. Clone the Repository

git clone https://github.com/web9211/Commonly-community-platform.git

cd Commonly-community-platform

2. Install Dependencies

npm install

3. Create the Database

The repository includes "database.sql", which creates the "commonly_db" database and its required tables.

Import it using:

mysql -u YOUR_DB_USER -p < database.sql

Replace "YOUR_DB_USER" with your database username.

Alternatively, execute the contents of "database.sql" using your database provider's SQL editor.

The database includes these tables:

- "user_account"
- "user_profile"
- "posts"
- "commonly_memberships"
- "commonly_payments"
- "commonly_ai_usage"

The SQL file contains the database schema, not production account records or application data.

4. Configure Environment Variables

Create a local environment file:

cp .env.example .env

Open ".env" and configure the following values:

Variable| Description
"PORT"| Application port. Defaults to 3000.
"DB_HOST"| Database server hostname.
"DB_PORT"| Database server port.
"DB_USER"| Database username.
"DB_PASSWORD"| Database password.
"DB_NAME"| Database name, normally "commonly_db".
"DB_SSL"| Set to "true" when database SSL is required.
"GEMINI_API_KEY"| Google Gemini API key.
"GEMINI_MODEL"| Gemini model used by GoodOne AI.
"PAYPAL_CLIENT_ID"| PayPal application client ID.
"PAYPAL_CLIENT_SECRET"| PayPal application secret.
"PAYPAL_CURRENCY"| Payment currency, such as USD.
"PAYPAL_MODE"| PayPal environment, such as "sandbox".
"PAYPAL_API_BASE"| PayPal API endpoint.
"COMMONLY_PLUS_PRICE"| Commonly Plus membership price.

The ".env.example" file contains the configuration template and example defaults.

Important: Never commit your actual ".env" file, database passwords, API keys, or PayPal secrets to GitHub.

5. Start the Application

npm start

For a standard local setup, open:

http://localhost:3000

The application uses the configured "PORT" value when provided.

---

Demo Account

A shared demonstration account is available for exploring the application.

Field| Details
Email| user123@gmail.com
Password| 1234567890
Membership| Commonly Plus

This account is intended for demonstration and testing. Because it is shared, avoid storing personal information or sensitive data in it.

---

Testing the Application

You can explore the main application features through the live deployment:

https://commonly-qwaf.onrender.com

Suggested areas to explore:

1. Register or sign in.
2. Browse community offers and requests.
3. Create and manage posts.
4. Explore profile functionality.
5. Access Commonly Plus features using the demonstration account.
6. Try GoodOne AI post-writing assistance.
7. Explore the PayPal membership payment flow where sandbox credentials are configured.

PayPal sandbox payments require an appropriately configured PayPal developer application and sandbox accounts.

---

Security

Commonly incorporates several security-related practices:

- Password hashing using "bcryptjs".
- Session-based user authentication.
- Server-side authorization for user-specific operations.
- Server-side payment order capture and verification.
- Environment-based configuration for database and external API credentials.
- Separation of database schema from production application data.

API credentials and database secrets should always be configured through environment variables rather than committed to source control.

---

Configuration Notes

The application uses the following external services:

Database: A compatible MySQL database service is required to store accounts, profiles, posts, memberships, payments, and AI usage information.

Google Gemini: A valid Gemini API key is required to use GoodOne AI.

PayPal: PayPal developer credentials are required to test or enable the membership payment integration. Sandbox configuration is provided as the starting point.

---

Vision

Commonly is built around a simple idea: communities become stronger when people help one another.

By bringing offers and requests together in one platform, Commonly aims to make cooperation more accessible, organized, and practical.

Good things grow together.

---

License

This project is licensed under the MIT License. See the "LICENSE" (LICENSE) file for details.
