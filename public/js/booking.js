let hostId = null;

let selectedTime = null;


const dateInput =
    document.getElementById("bookingDate");

const timeSlots =
    document.getElementById("timeSlots");

const guestSection =
    document.getElementById("guestSection");

const selectedTimeText =
    document.getElementById("selectedTime");

const bookingForm =
    document.getElementById("bookingForm");

const bookingMessage =
    document.getElementById("bookingMessage");


// Set minimum date to today

const today =
    new Date().toISOString().split("T")[0];

dateInput.min = today;


// Get host

async function loadHost() {

    try {

        const response =
            await fetch("/api/booking-host");

        const data =
            await response.json();


        if (!data.success) {

            timeSlots.innerHTML = `
                <p class="booking-message">
                    No host is available yet.
                </p>
            `;

            return;

        }


        hostId = data.host.id;

    } catch (error) {

        console.error(error);

    }

}


loadHost();


// Date changed

dateInput.addEventListener("change", async () => {

    const date = dateInput.value;

    selectedTime = null;

    guestSection.style.display = "none";


    if (!date || !hostId) {
        return;
    }


    timeSlots.innerHTML = `
        <p class="booking-message">
            Loading available times...
        </p>
    `;


    try {

        const response = await fetch(
            `/api/available-slots?host_id=${hostId}&date=${date}`
        );


        const data = await response.json();


        if (!data.success || data.slots.length === 0) {

            timeSlots.innerHTML = `
                <p class="booking-message">
                    No available times for this date.
                </p>
            `;

            return;

        }


        timeSlots.innerHTML = "";


        data.slots.forEach(time => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "time-slot";

            button.textContent = formatTime(time);


            button.addEventListener(
                "click",
                () => selectTime(time, button)
            );


            timeSlots.appendChild(button);

        });

    } catch (error) {

        console.error(error);

        timeSlots.innerHTML = `
            <p class="booking-message">
                Unable to load available times.
            </p>
        `;

    }

});


// Select time

function selectTime(time, button) {

    document
        .querySelectorAll(".time-slot")
        .forEach(slot => {

            slot.classList.remove("selected");

        });


    button.classList.add("selected");


    selectedTime = time;

    selectedTimeText.textContent =
        formatTime(time);


    guestSection.style.display = "block";

    guestSection.scrollIntoView({
        behavior: "smooth"
    });

}


// Book meeting

bookingForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!selectedTime) {

            bookingMessage.textContent =
                "Please select a time.";

            return;

        }


        const guestName =
            document.getElementById("guestName")
                .value
                .trim();


        const guestEmail =
            document.getElementById("guestEmail")
                .value
                .trim();


        const date =
            dateInput.value;


        try {

            const response = await fetch(
                "/api/bookings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        host_id: hostId,

                        guest_name:
                            guestName,

                        guest_email:
                            guestEmail,

                        date,

                        time:
                            selectedTime

                    })

                }
            );


            const data =
                await response.json();


            if (!data.success) {

                bookingMessage.textContent =
                    data.message;

                return;

            }


            // Save confirmation email information

            if (data.confirmationEmail) {

                localStorage.setItem(
                    "confirmationEmail",
                    JSON.stringify(
                        data.confirmationEmail
                    )
                );

            }


            // Redirect to confirmation page

            window.location.href =
                `confirmation.html?booking=${data.bookingId}`;

        } catch (error) {

            console.error(error);

            bookingMessage.textContent =
                "Unable to create booking.";

        }

    }
);


// Convert time

function formatTime(time) {

    const [hour, minute] =
        time.split(":");

    let h = parseInt(hour);

    const ampm =
        h >= 12 ? "PM" : "AM";

    h = h % 12;

    h = h || 12;

    return `${h}:${minute} ${ampm}`;

}