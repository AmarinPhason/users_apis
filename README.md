# Users APIs

This is a simple user management API system built with Node.js and Express. It includes features such as user registration, login, logout, profile image updates, password resets, and forgot password functionality.

## Features

- **User Registration**: Register a new user with a unique username and email.
- **User Login**: Authenticate users with email and password.
- **User Logout**: Log out users and clear the authentication cookies.
- **Profile Image Update**: Update the user's profile image using Cloudinary.
- **Password Update**: Change the user's password.
- **Forgot Password**: Request a password reset link via email.

## Technologies Used

- **Node.js**: Backend JavaScript runtime.
- **Express**: Web framework for building APIs.
- **MongoDB & Mongoose**: Database and object data modeling.
- **bcrypt**: Password hashing.
- **Cloudinary**: File storage service for profile images.
- **jsonwebtoken**: Used for user authentication tokens.
- **multer**: Middleware for handling file uploads.
- **nodemailer**: Sending emails for password reset functionality.
- **cookie-parser**: Middleware to handle cookies.
- **dotenv**: Environment variable management.
- **CORS**: Handling cross-origin requests.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AmarinPhason/users_apis.git
   ```
