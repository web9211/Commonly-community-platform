/* 1. Get HTML elements */

const introScreen = document.getElementById("introScreen");
const authScreen = document.getElementById("authScreen");
const startButton = document.getElementById("startButton");

const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const agreeTermsInput = document.getElementById("agreeTerms");

const togglePasswordButton = document.getElementById("togglePassword");

const googleButton = document.getElementById("googleButton");
const signInButton = document.getElementById("signInButton");
const createAccountButton = document.getElementById("createAccountButton");

const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");

const toast = document.getElementById("toast");


/* 2. Current form state */

let isSignInMode = false;
let toastTimer = null;


/* 3. Show temporary messages */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {

        toast.classList.remove("show");

    }, 3200);

}


/* 4. Intro screen */

startButton.addEventListener("click", function () {

    introScreen.classList.add("hidden");

    authScreen.classList.remove("hidden");

});


/* 5. Show / hide password */

togglePasswordButton.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePasswordButton.textContent = "Hide";

        togglePasswordButton.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        passwordInput.type = "password";

        togglePasswordButton.textContent = "Show";

        togglePasswordButton.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});


/* 6. Clear validation errors */

function clearErrors() {

    document.getElementById("nameError").textContent = "";

    document.getElementById("emailError").textContent = "";

    document.getElementById("passwordError").textContent = "";

    document.getElementById("termsError").textContent = "";

}


/* 7. Frontend validation */

function validateForm() {

    clearErrors();

    let isValid = true;

    const name = fullNameInput.value.trim();

    const email = emailInput.value.trim();

    const password = passwordInput.value;


    /* Validate name only during signup */

    if (!isSignInMode && name.length < 2) {

        document.getElementById("nameError").textContent =
            "Please enter your name.";

        isValid = false;

    }


    /* Validate email */

    if (email === "" || !emailInput.checkValidity()) {

        document.getElementById("emailError").textContent =
            "Enter a valid email address.";

        isValid = false;

    }


    /* Validate password */

    if (password.length < 8) {

        document.getElementById("passwordError").textContent =
            "Use at least 8 characters.";

        isValid = false;

    }


    /* Terms are required only during signup */

    if (!isSignInMode && !agreeTermsInput.checked) {

        document.getElementById("termsError").textContent =
            "Please agree before creating an account.";

        isValid = false;

    }


    return isValid;

}


/* 8. Signup and signin form submission */

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    /* Stop if frontend validation fails */

    if (!validateForm()) {

        showToast("Please check the highlighted fields.");

        return;

    }


    /* Prevent multiple submissions */

    if (createAccountButton.disabled) {

        return;

    }


    /* Get form data */

    const name = fullNameInput.value.trim();

    const email = emailInput.value.trim();

    const password = passwordInput.value;


    /* Select route based on current mode */

    const endpoint = isSignInMode
        ? "/login"
        : "/signup";


    /* Signup sends name, email and password.
       Signin sends email and password. */

    const userData = isSignInMode
        ? {
            email,
            password
        }
        : {
            name,
            email,
            password
        };


    /* Save original button text */

    const originalButtonText = isSignInMode
        ? 'Sign in <span class="button-arrow">→</span>'
        : 'Create account <span class="button-arrow">→</span>';


    try {

        /* Disable button while request is processing */

        createAccountButton.disabled = true;

        createAccountButton.textContent = isSignInMode
            ? "Signing in..."
            : "Creating account...";


        /* Send request to Express */

        const response = await fetch(endpoint, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userData)

        });


        /* Read server response */

        const data = await response.json();


        /* Handle unsuccessful response */

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                (isSignInMode
                    ? "Unable to sign in."
                    : "Unable to create account.")
            );

            return;

        }


        /* Successful signup */

        if (!isSignInMode) {

            showToast("Account created successfully!");

        }


        /* Successful signin */

        else {

            showToast("Signed in successfully!");

        }


        /* Redirect after successful authentication */

        window.location.href = data.redirect || "/";


    } catch (error) {

        /* Network or unexpected response error */

        console.error("Authentication error:", error);

        showToast(
            "Unable to connect to the server. Please try again."
        );

    } finally {

        /* Restore button */

        createAccountButton.disabled = false;

        createAccountButton.innerHTML = originalButtonText;

    }

});


/* 9. Switch between signup and signin */

signInButton.addEventListener("click", function () {

    isSignInMode = !isSignInMode;


    /* Change card styling */

    const authCard = document.querySelector(".auth-card");

    authCard.classList.toggle(
        "login-mode",
        isSignInMode
    );


    /* Signup -> Signin */

    if (isSignInMode) {

        formTitle.innerHTML = "Welcome<br><em>back.</em>";

        formSubtitle.textContent =
            "Sign in and pick up where your community left off.";

        fullNameInput.closest(".field").classList.add("hidden");

        createAccountButton.innerHTML =
            'Sign in <span class="button-arrow">→</span>';

        signInButton.textContent = "Create an account";

        passwordInput.autocomplete = "current-password";

    }


    /* Signin -> Signup */

    else {

        formTitle.innerHTML =
            "Make room for<br><em>good things.</em>";

        formSubtitle.textContent =
            "Create your account and start sharing with people around you.";

        fullNameInput.closest(".field").classList.remove("hidden");

        createAccountButton.innerHTML =
            'Create account <span class="button-arrow">→</span>';

        signInButton.textContent = "Sign in";

        passwordInput.autocomplete = "new-password";

    }


    /* Clear old form errors */

    clearErrors();


    /* Clear old input values */

    signupForm.reset();


    /* Reset password visibility */

    passwordInput.type = "password";

    togglePasswordButton.textContent = "Show";

    togglePasswordButton.setAttribute(
        "aria-label",
        "Show password"
    );


    /* Clear previous messages */

    toast.classList.remove("show");

});


/* 10. Google signin placeholder */

googleButton.addEventListener("click", function () {

    showToast("Google sign in will be available soon");

});


/* 11. Terms placeholder */

document.getElementById("termsLink").addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        showToast(
            "Terms page will be added with project documentation."
        );

    }
);


/* 12. Privacy placeholder */

document.getElementById("privacyLink").addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        showToast(
            "Privacy page will be added before launch."
        );

    }
);
