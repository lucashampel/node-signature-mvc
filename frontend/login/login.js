console.log("login loaded");
// ---- CONFIGURE THESE TO MATCH YOUR API ----
//const API_BASE_URL = window.location.origin; // your backend base URL
const LOGIN_ENDPOINT = "/auth/login";         // your login route
const REDIRECT_URL =  "/home";           // page after successful login
// ------------------------------------------

// If your API uses session cookies (express-session), keep `credentials: "include"`.
// If it's pure token-based and you don't use cookies, you can remove that.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value;

    // Optional: simple guard
    if (!email || !password) {
      errorMessage.textContent = "Preencha email e senha.";
      return;
    }

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try to parse error message from API
        let errorText = "Falha no login. Verifique seus dados.";
        try {
          const data = await response.json();
          if (data && (data.error || data.message)) {
            errorText = data.error || data.message;
          }
        } catch {
          // ignore JSON parse fail, keep default text
        }

        errorMessage.textContent = errorText;
        return;
      }

      // If you return a token instead of using sessions, you could do:
      // const data = await response.json();
      // localStorage.setItem("authToken", data.token);

      // Successful auth → go to main page
      window.location.href = REDIRECT_URL;
    } catch (err) {
      console.error("Login error:", err);
      errorMessage.textContent =
        "Erro de conexão. Tente novamente em alguns instantes.";
    }
  });
});
