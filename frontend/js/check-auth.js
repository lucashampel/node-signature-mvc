(async () => {
  try {
    const res = await fetch("/auth/me", {
      credentials: "include"
    });

    const data = await res.json();

    if (!data.user) {
      // Not logged in → go to login page
      window.location.href = "/login";
      return;
    }

    window.currentUser = data.user;

     const adminLink = document.getElementById("admin-link");
    if (adminLink && data.user.role === "admin") {
      adminLink.style.display = "block";
    }

  } catch (err) {
    console.error("Auth check failed:", err);
    window.location.href = "/login";
  }
})();
