# Calendly Clone

A functional web-based Calendly Clone that allows users to manage their availability and lets visitors book, reschedule, and cancel meetings.

## 🚀 Project Overview

This project is a functional scheduling platform inspired by Calendly.

Users can:

* Create an account
* Log in
* Set their availability
* View upcoming meetings
* View past meetings
* Manage bookings
* Cancel meetings
* Reschedule meetings
* Receive notifications

Visitors can:

* Select an available date
* View available time slots
* Select a meeting time
* Enter their name and email
* Book a meeting
* Receive a booking confirmation

## ✨ Features

### User Authentication

* Sign Up
* Login
* Logout
* Local session management

### Availability Management

* Select available days
* Set start and end times
* Save availability
* Delete availability

### Meeting Booking

* Select a date
* View available time slots
* Select a time
* Enter guest information
* Confirm booking

### Meeting Management

* View upcoming meetings
* View past meetings
* Cancel meetings
* Reschedule meetings

### Notifications

* Booking notifications
* Cancellation notifications
* Rescheduling notifications
* Mark notifications as read
* Delete notifications
* Unread notification counter

### Confirmation

* Booking confirmation page
* Booking ID
* Simulated confirmation email display

### Responsive Design

The website is responsive for:

* Desktop
* Tablet
* Mobile devices

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite

### Other Technologies

* CORS
* dotenv
* Nodemailer

## 📁 Project Structure

```text
Calendly-Clone/
│
├── public/
│   ├── index.html
│   ├── signup.html
│   ├── login.html
│   ├── dashboard.html
│   ├── availability.html
│   ├── booking.html
│   ├── confirmation.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── availability.css
│   │   ├── booking.css
│   │   └── confirmation.css
│   │
│   └── js/
│       ├── auth.js
│       ├── dashboard.js
│       ├── availability.js
│       ├── booking.js
│       └── confirmation.js
│
├── server.js
├── database.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/ashlindirect1-alt/Calendly-Clone.git
```

Open the project folder:

```bash
cd Calendly-Clone
```

Install dependencies:

```bash
npm install
```

## ▶️ Run the Project

Start the server:

```bash
node server.js
```

The application will run at:

```text
http://localhost:3000/
```

Open the link in your browser.

## 🧪 Testing

The following features were tested:

* Sign Up
* Login
* Availability creation
* Availability deletion
* Meeting booking
* Booking confirmation
* Dashboard
* Meeting cancellation
* Meeting rescheduling
* Notifications
* Mark as Read
* Notification deletion
* Responsive mobile layout

## 📧 Confirmation Email

The current project uses a simulated/local confirmation email flow for demonstration.

After a successful booking, the confirmation page displays:

* Recipient email
* Email subject
* Confirmation message

No real email credentials are required for the demo.

## 🔒 Security Note

This project is created for learning and demonstration purposes.

Authentication and password handling should be strengthened before using the application in a real production environment.

## 👩‍💻 Developer

**Ashlin Naeem**

BS Information Technology Student

GitHub:

https://github.com/ashlindirect1-alt

## 📌 Project Status

**Completed ✅**

The Calendly Clone is functional, responsive, and ready for GitHub submission and portfolio demonstration.

## 🚀 Future Improvements

Possible future improvements include:

* Real email delivery
* Secure password hashing
* User-specific booking links
* Google Calendar integration
* Multiple hosts
* Time-zone support
* Email reminders
* Improved authentication
* Production deployment

---

**Just completed my Calendly Clone! Now scheduling meetings is effortless. 🚀**