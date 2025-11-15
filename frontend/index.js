const LOGOUT_ENDPOINT = "/auth/logout";
const REDIRECT_URL =  "/login";

document.getElementById("logout-btn").addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(LOGOUT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // send/receive cookies
      });

      if (!response.ok) {
        // Try to parse error message from API
        //let errorText = "Falha no logout.";
        try {
        //   const data = await response.json();
        //   if (data && (data.error || data.message)) {
        //     errorText = data.error || data.message;
        //   }
        } catch {
          // ignore JSON parse fail, keep default text
        }
        return;
      }

      // If you return a token instead of using sessions, you could do:
      // const data = await response.json();
      // localStorage.setItem("authToken", data.token);

      // Successful auth → go to main page
      window.location.href = REDIRECT_URL;
    } catch (err) {
      alert("Logout error:", err);
    }
  });