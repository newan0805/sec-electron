Readme

Overview
This project consists of a multi-page web application built with HTML, CSS, and JavaScript. 
The Electron framework is utilized to convert the web application into a desktop application. 
The application provides functionality for user authentication, profile viewing, and captcha verification.

Pages
1. index.html (Login Page)
This page provides a login form with fields for entering a username and password.
Bootstrap is used for styling.
JavaScript functions for user login and error handling are defined in renderer.js.

2. signup.html (Signup Page)
This page allows users to create a new account by entering a username, email, and password.
Bootstrap is used for styling.
JavaScript functions for user registration and error handling are defined in renderer.js.

3. profile.html (Profile Page)
This page displays user profile information, such as username, email, and password.
The user data is retrieved from local storage and displayed using JavaScript.
Users can log out from this page.

4. captcha.html (Captcha Verification Page)
This page displays a captcha image and requires users to enter the corresponding captcha value.
Captcha data is managed through captcha.json.
JavaScript functions handle captcha validation and OTP entry.


Electron Application
The Electron framework is used to convert the web application into a desktop application.
The main Electron script is located in main.js.

Nodemailer is used for sending OTP (One-Time Password) to user email addresses.
Bcrypt is used for password hashing during user registration.
Randomstring is used to generate random OTP values.

File Handling
User data is stored in users.json.
Captcha data is stored in captcha.json.

Getting Started
Install Node.js and npm if not already installed.
Run 'npm install' to install project dependencies.
Start the application using 'npm start'.

The application will open as a desktop application with the login page.

Usage
Use the login page to enter your credentials and log in.
Create a new account using the signup page.
View your profile information on the profile page.
Perform captcha verification on the captcha page.

Note
This readme assumes you are familiar with web development, JavaScript, HTML, and CSS.
Make sure to handle sensitive data securely in a production environment.
For additional details on functions and code structure, refer to the respective HTML and JavaScript files.
Feel free to explore and enhance the project as needed!