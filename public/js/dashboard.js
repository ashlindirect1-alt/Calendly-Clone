const userData = localStorage.getItem("calendlyUser");

if (!userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("userName").textContent = user.name;

    loadBookings(user.id);
    loadNotifications(user.id);
}


// Load bookings
async function loadBookings(userId) {
    try {
        const response = await fetch(`/api/bookings/${userId}`);
        const data = await response.json();

        if (!data.success) {
            console.error(data.message);
            return;
        }

        const bookings = data.bookings;

        const upcomingContainer =
            document.getElementById("upcomingMeetings");

        const pastContainer =
            document.getElementById("pastMeetings");

        const upcomingCount =
            document.getElementById("upcomingCount");

        const pastCount =
            document.getElementById("pastCount");

        // Clear old content
        upcomingContainer.innerHTML = "";
        pastContainer.innerHTML = "";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let upcoming = [];
        let past = [];

        bookings.forEach(booking => {
            const bookingDate = new Date(
                `${booking.date}T00:00:00`
            );

            if (
                bookingDate >= today &&
                booking.status === "confirmed"
            ) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        // Update counts
        upcomingCount.textContent = upcoming.length;
        pastCount.textContent = past.length;

        // Show upcoming meetings
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <p>No upcoming meetings.</p>
                </div>
            `;
        } else {
            upcoming.forEach(booking => {
                upcomingContainer.innerHTML += createBookingCard(
                    booking,
                    true
                );
            });
        }

        // Show past meetings
        if (past.length === 0) {
            pastContainer.innerHTML = `
                <div class="empty-state">
                    <p>No past meetings.</p>
                </div>
            `;
        } else {
            past.forEach(booking => {
                pastContainer.innerHTML += createBookingCard(
                    booking,
                    false
                );
            });
        }

    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}


// Create booking card
function createBookingCard(booking, isUpcoming) {
    return `
        <div class="meeting-card">

            <div class="meeting-info">

                <h3>${booking.guest_name}</h3>

                <p>
                    📧 ${booking.guest_email}
                </p>

                <p>
                    📅 ${formatDate(booking.date)}
                </p>

                <p>
                    🕐 ${formatTime(booking.time)}
                </p>

                <p>
                    Status:
                    <strong>${booking.status}</strong>
                </p>

            </div>

            ${
                isUpcoming
                    ? `

                       <div class="meeting-actions">
 
                          <button
                              class="reschedule-btn"
                              onclick="rescheduleBooking(${booking.id})"
                            >
                               Reschedule
                            </button>

                            <button
                              class="cancel-btn"
                              onclick="cancelBooking(${booking.id})"
                            >
                               Cancel Meeting
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;
}


// Format date
function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}


async function cancelBooking(bookingId) {
    const confirmed = confirm(
        "Are you sure you want to cancel this meeting?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/bookings/${bookingId}/cancel`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert("Meeting cancelled successfully!");

        // Reload dashboard bookings
        const user = JSON.parse(
            localStorage.getItem("calendlyUser")
        );

        loadBookings(user.id);

    } catch (error) {
        console.error("Cancel booking error:", error);
        alert("Unable to cancel meeting.");
    }
}


// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("calendlyUser");
    window.location.href = "login.html";
});

async function rescheduleBooking(bookingId) {

    const newDate = prompt(
        "Enter new date (YYYY-MM-DD):"
    );

    if (!newDate) {
        return;
    }

    try {

        // Get current user
        const user = JSON.parse(
            localStorage.getItem("calendlyUser")
        );

        // Get available slots
        const response = await fetch(
            `/api/available-slots?host_id=${user.id}&date=${newDate}`
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        if (data.slots.length === 0) {
            alert(
                "No available time slots on this date."
            );
            return;
        }

        // Show available slots
        const slotList = data.slots.join(", ");

        const newTime = prompt(
            `Available times:\n\n${slotList}\n\nEnter one available time (HH:MM):`
        );

        if (!newTime) {
            return;
        }

        if (!data.slots.includes(newTime)) {
            alert(
                "Please select a time from the available slots."
            );
            return;
        }

        // Reschedule booking
        const updateResponse = await fetch(
            `/api/bookings/${bookingId}/reschedule`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: newDate,
                    time: newTime
                })
            }
        );

        const updateData =
            await updateResponse.json();

        if (!updateData.success) {
            alert(updateData.message);
            return;
        }

        alert(
            "Meeting rescheduled successfully!"
        );

        loadBookings(user.id);

    } catch (error) {

        console.error(
            "Reschedule error:",
            error
        );

        alert(
            "Unable to reschedule meeting."
        );
    }
}

// ===============================
// LOAD NOTIFICATIONS
// ===============================

async function loadNotifications(userId) {

    const notificationsList =
        document.getElementById("notificationsList");

    try {

        const response = await fetch(
            `/api/notifications/${userId}`
        );

        const data = await response.json();

        if (!data.success) {
            notificationsList.innerHTML = `
                <div class="empty-message">
                    Unable to load notifications.
                </div>
            `;
            return;
        }

        const unreadCount = data.notifications.filter(
            notification => notification.is_read === 0
        ).length;

        const notificationCount =
            document.getElementById("notificationCount");

        notificationCount.textContent = unreadCount;

        if (data.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-message">
                    No notifications.
                </div>
            `;
            return;
        }

        notificationsList.innerHTML =
            data.notifications.map(notification => {

                return `
                    <div class="meeting-card">

                        <div class="meeting-info">

                            <h3>🔔 Notification</h3>

                            <p>
                                ${notification.message}
                            </p>

                            <div class="notification-actions">

                                ${
                                   notification.is_read === 0
                                   ? `
                                        <button
                                         class="read-btn"
                                          onclick="markNotificationRead(${notification.id})"
                                        >
                                          Mark as Read
                                        </button>
                                    `
                                    : `
                                        <span class="read-status">
                                          ✓ Read
                                        </span>
                                    `
                                }

                                <button
                                    class="delete-notification-btn"
                                    onclick="deleteNotification(${notification.id})"
                                >
                                   Delete
                                </button>

                            </div>
                            <small>
                                ${notification.created_at}
                            </small>

                        </div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

        notificationsList.innerHTML = `
            <div class="empty-message">
                Unable to load notifications.
            </div>
        `;
    }
}


// ===============================
// MARK NOTIFICATION AS READ
// ===============================

async function markNotificationRead(notificationId) {

    try {

        const response = await fetch(
            `/api/notifications/${notificationId}/read`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        const user = JSON.parse(
            localStorage.getItem("calendlyUser")
        );

        loadNotifications(user.id);

    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );

        alert(
            "Unable to mark notification as read."
        );
    }
}


// ===============================
// DELETE NOTIFICATION
// ===============================

async function deleteNotification(notificationId) {

    const confirmed = confirm(
        "Are you sure you want to delete this notification?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/notifications/${notificationId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        const user = JSON.parse(
            localStorage.getItem("calendlyUser")
        );

        loadNotifications(user.id);

    } catch (error) {

        console.error(
            "Delete notification error:",
            error
        );

        alert(
            "Unable to delete notification."
        );
    }
}