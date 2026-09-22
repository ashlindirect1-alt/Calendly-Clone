const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Calendly Clone API is working!"
    });
});


// ===============================
// SIGNUP
// ===============================

app.post("/api/signup", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, email, password], function(err) {

        if (err) {

            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to create account."
            });
        }

        res.json({
            success: true,
            message: "Account created successfully!",
            userId: this.lastID
        });

    });

});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.get(sql, [email, password], (err, user) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error."
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user
        });

    });

});


// ===============================
// GET AVAILABILITY
// ===============================

app.get("/api/availability/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM availability
        WHERE user_id = ?
        ORDER BY
            CASE day
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END
    `;

    db.all(sql, [userId], (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to load availability."
            });
        }

        res.json({
            success: true,
            availability: rows
        });

    });

});


// ===============================
// ADD AVAILABILITY
// ===============================

app.post("/api/availability", (req, res) => {

    const {
        user_id,
        day,
        start_time,
        end_time
    } = req.body;

    if (!user_id || !day || !start_time || !end_time) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    if (start_time >= end_time) {
        return res.status(400).json({
            success: false,
            message: "End time must be after start time."
        });
    }

    const sql = `
        INSERT INTO availability
        (user_id, day, start_time, end_time)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [user_id, day, start_time, end_time],
        function(err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to save availability."
                });
            }

            res.json({
                success: true,
                message: "Availability saved successfully!",
                id: this.lastID
            });

        }
    );

});


// ===============================
// DELETE AVAILABILITY
// ===============================

app.delete("/api/availability/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM availability WHERE id = ?",
        [id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to delete availability."
                });
            }

            res.json({
                success: true,
                message: "Availability deleted successfully."
            });

        }
    );

});


// ===============================
// CREATE BOOKING
// ===============================

app.post("/api/bookings", (req, res) => {

    const {
        host_id,
        guest_name,
        guest_email,
        date,
        time
    } = req.body;

    if (
        !host_id ||
        !guest_name ||
        !guest_email ||
        !date ||
        !time
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    // Check whether slot is already booked

    const checkSql = `
        SELECT id
        FROM bookings
        WHERE host_id = ?
        AND date = ?
        AND time = ?
        AND status = 'confirmed'
    `;

    db.get(
        checkSql,
        [host_id, date, time],
        (err, existingBooking) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: "This time slot is already booked."
                });
            }

            // Insert booking

            const insertSql = `
                INSERT INTO bookings
                (
                    host_id,
                    guest_name,
                    guest_email,
                    date,
                    time
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(
                insertSql,
                [
                    host_id,
                    guest_name,
                    guest_email,
                    date,
                    time
                ],
                function(err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Unable to create booking."
                        });
                    }

                    const bookingId = this.lastID;

                    // Create notification

                    const notificationSql = `
                        INSERT INTO notifications
                        (user_id, message)
                        VALUES (?, ?)
                    `;

                    const notificationMessage =
                        `New meeting booked with ${guest_name} on ${date} at ${time}.`;

                    db.run(
                        notificationSql,
                        [
                            host_id,
                            notificationMessage
                        ],
                        (notificationError) => {

                            if (notificationError) {
                                console.error(
                                    "Notification error:",
                                    notificationError.message
                                );
                            }

                            // Confirmation email message
                                const confirmationEmail = {
                                to: guest_email,
                                subject: "Meeting Confirmation - Calendly Clone",
                                message:
                                `Hello ${guest_name}, your meeting has been confirmed for ${date} at ${time}.`
                            };

                            res.json({
                                success: true,
                                message: "Meeting booked successfully!",
                                bookingId: bookingId,
                                confirmationEmail: confirmationEmail
                            });
                        }
                    );

                }
            );

        }
    );

});


// ===============================
// GET AVAILABLE TIME SLOTS
// ===============================

app.get("/api/available-slots", (req, res) => {

    const {
        host_id,
        date
    } = req.query;

    if (!host_id || !date) {
        return res.status(400).json({
            success: false,
            message: "Host and date are required."
        });
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const day = dayNames[selectedDate.getDay()];

    const availabilitySql = `
        SELECT start_time, end_time
        FROM availability
        WHERE user_id = ?
        AND day = ?
    `;

    db.all(
        availabilitySql,
        [host_id, day],
        (err, availabilityRows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (availabilityRows.length === 0) {
                return res.json({
                    success: true,
                    slots: []
                });
            }

            const bookingSql = `
                SELECT time
                FROM bookings
                WHERE host_id = ?
                AND date = ?
                AND status = 'confirmed'
            `;

            db.all(
                bookingSql,
                [host_id, date],
                (err, bookingRows) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    const bookedTimes =
                        bookingRows.map(row => row.time);

                    const slots = [];

                    availabilityRows.forEach(period => {

                        let current =
                            toMinutes(period.start_time);

                        const end =
                            toMinutes(period.end_time);

                        while (current + 30 <= end) {

                            const slot =
                                minutesToTime(current);

                            if (!bookedTimes.includes(slot)) {
                                slots.push(slot);
                            }

                            current += 30;
                        }

                    });

                    res.json({
                        success: true,
                        day,
                        slots
                    });

                }
            );

        }
    );

});


// ===============================
// TIME FUNCTIONS
// ===============================

function toMinutes(time) {

    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;
}


function minutesToTime(totalMinutes) {

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0")
    );
}


// ===============================
// GET BOOKING HOST
// ===============================

app.get("/api/booking-host", (req, res) => {

    db.get(
        `
        SELECT id, name, email
        FROM users
        ORDER BY id ASC
        LIMIT 1
        `,
        (err, user) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to find host."
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No host account found."
                });
            }

            res.json({
                success: true,
                host: user
            });

        }
    );

});


// ===============================
// GET BOOKINGS
// ===============================

app.get("/api/bookings/:hostId", (req, res) => {

    const hostId = req.params.hostId;

    const sql = `
        SELECT *
        FROM bookings
        WHERE host_id = ?
        ORDER BY date ASC, time ASC
    `;

    db.all(sql, [hostId], (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to load bookings."
            });
        }

        res.json({
            success: true,
            bookings: rows
        });

    });

});


// ===============================
// CANCEL BOOKING
// ===============================

app.patch("/api/bookings/:id/cancel", (req, res) => {

    const bookingId = req.params.id;

    // Get booking information first
    const getBookingSql = `
        SELECT host_id, guest_name, date, time
        FROM bookings
        WHERE id = ?
        AND status = 'confirmed'
    `;

    db.get(
        getBookingSql,
        [bookingId],
        (err, booking) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
            }

            // Cancel the booking
            const updateSql = `
                UPDATE bookings
                SET status = 'cancelled'
                WHERE id = ?
            `;

            db.run(
                updateSql,
                [bookingId],
                function(err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Unable to cancel meeting."
                        });
                    }

                    // Create cancellation notification
                    const notificationSql = `
                        INSERT INTO notifications
                        (user_id, message)
                        VALUES (?, ?)
                    `;

                    const notificationMessage =
                        `Meeting cancelled: ${booking.guest_name}'s meeting on ${booking.date} at ${booking.time} was cancelled.`;

                    db.run(
                        notificationSql,
                        [
                            booking.host_id,
                            notificationMessage
                        ],
                        (notificationError) => {

                            if (notificationError) {
                                console.error(
                                    "Cancellation notification error:",
                                    notificationError.message
                                );
                            }

                            res.json({
                                success: true,
                                message: "Meeting cancelled successfully."
                            });

                        }
                    );

                }
            );

        }
    );

});


// ===============================
// RESCHEDULE BOOKING
// ===============================

app.patch("/api/bookings/:id/reschedule", (req, res) => {

    const bookingId = req.params.id;
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).json({
            success: false,
            message: "New date and time are required."
        });
    }

    // Get existing booking information
    db.get(
        `
        SELECT host_id, guest_name, date AS old_date, time AS old_time
        FROM bookings
        WHERE id = ?
        AND status = 'confirmed'
        `,
        [bookingId],
        (err, booking) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
            }

            // Check whether the new slot is already booked
            db.get(
                `
                SELECT id
                FROM bookings
                WHERE host_id = ?
                AND date = ?
                AND time = ?
                AND status = 'confirmed'
                AND id != ?
                `,
                [
                    booking.host_id,
                    date,
                    time,
                    bookingId
                ],
                (err, existingBooking) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (existingBooking) {
                        return res.status(400).json({
                            success: false,
                            message: "This time slot is already booked."
                        });
                    }

                    // Update booking
                    db.run(
                        `
                        UPDATE bookings
                        SET date = ?, time = ?
                        WHERE id = ?
                        `,
                        [date, time, bookingId],
                        function(err) {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Unable to reschedule meeting."
                                });
                            }

                            // Create reschedule notification
                            const notificationSql = `
                                INSERT INTO notifications
                                (user_id, message)
                                VALUES (?, ?)
                            `;

                            const notificationMessage =
                                `Meeting rescheduled: ${booking.guest_name}'s meeting was moved from ${booking.old_date} at ${booking.old_time} to ${date} at ${time}.`;

                            db.run(
                                notificationSql,
                                [
                                    booking.host_id,
                                    notificationMessage
                                ],
                                (notificationError) => {

                                    if (notificationError) {
                                        console.error(
                                            "Reschedule notification error:",
                                            notificationError.message
                                        );
                                    }

                                    res.json({
                                        success: true,
                                        message: "Meeting rescheduled successfully!"
                                    });

                                }
                            );

                        }
                    );

                }   
            );

        }
    );

});


// ===============================
// GET NOTIFICATIONS
// ===============================

app.get("/api/notifications/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [userId], (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to load notifications."
            });
        }

        res.json({
            success: true,
            notifications: rows
        });

    });

});


// ===============================
// MARK NOTIFICATION AS READ
// ===============================

app.patch("/api/notifications/:id/read", (req, res) => {

    const notificationId = req.params.id;

    const sql = `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
    `;

    db.run(sql, [notificationId], function(err) {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to mark notification as read."
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read."
        });

    });

});


// ===============================
// DELETE NOTIFICATION
// ===============================

app.delete("/api/notifications/:id", (req, res) => {

    const notificationId = req.params.id;

    const sql = `
        DELETE FROM notifications
        WHERE id = ?
    `;

    db.run(sql, [notificationId], function(err) {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to delete notification."
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.json({
            success: true,
            message: "Notification deleted successfully."
        });

    });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Calendly Clone running at http://localhost:${PORT}`
    );

});