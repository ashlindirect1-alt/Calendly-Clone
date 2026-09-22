// ===============================
// CONFIRMATION PAGE
// ===============================


// Get booking ID from URL

const params =
    new URLSearchParams(window.location.search);

const bookingId =
    params.get("booking");


document.getElementById("bookingId")
    .textContent = bookingId || "N/A";


// Get confirmation email data

const confirmationEmail =
    JSON.parse(
        localStorage.getItem("confirmationEmail")
    );


// Display confirmation email

if (confirmationEmail) {

    document.getElementById("emailTo")
        .textContent = confirmationEmail.to;

    document.getElementById("emailSubject")
        .textContent = confirmationEmail.subject;

    document.getElementById("emailMessage")
        .textContent = confirmationEmail.message;

} else {

    document.getElementById("emailConfirmation")
        .style.display = "none";

}