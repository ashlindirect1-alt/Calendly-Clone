const userData = localStorage.getItem("calendlyUser");


// Protect page

if (!userData) {

    window.location.href = "login.html";

}


const user = JSON.parse(userData);

const form = document.getElementById("availabilityForm");

const list = document.getElementById("availabilityList");

const message = document.getElementById("availabilityMessage");


// Load availability

async function loadAvailability() {

    try {

        const response = await fetch(
            `/api/availability/${user.id}`
        );

        const data = await response.json();

        if (!data.success) {
            return;
        }


        if (data.availability.length === 0) {

            list.innerHTML = `
                <div class="empty-message">
                    No availability added yet.
                </div>
            `;

            return;
        }


        list.innerHTML = "";


        data.availability.forEach(item => {

            const div = document.createElement("div");

            div.className = "availability-item";

            div.innerHTML = `

                <div class="availability-details">

                    <h3>${item.day}</h3>

                    <p>
                        ${formatTime(item.start_time)}
                        -
                        ${formatTime(item.end_time)}
                    </p>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteAvailability(${item.id})"
                >
                    Delete
                </button>

            `;

            list.appendChild(div);

        });

    } catch (error) {

        console.error(error);

    }

}


// Convert 24-hour time to readable format

function formatTime(time) {

    const [hour, minute] = time.split(":");

    let h = parseInt(hour);

    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;

    h = h || 12;

    return `${h}:${minute} ${ampm}`;

}


// Save availability

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const day = document.getElementById("day").value;

    const start_time =
        document.getElementById("startTime").value;

    const end_time =
        document.getElementById("endTime").value;


    try {

        const response = await fetch("/api/availability", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_id: user.id,

                day,

                start_time,

                end_time

            })

        });


        const data = await response.json();


        message.textContent = data.message;


        if (data.success) {

            form.reset();

            loadAvailability();

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to server.";

    }

});


// Delete availability

async function deleteAvailability(id) {

    try {

        const response = await fetch(
            `/api/availability/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (data.success) {

            loadAvailability();

        }

    } catch (error) {

        console.error(error);

    }

}


// Logout

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("calendlyUser");

        window.location.href = "login.html";

    });


loadAvailability();