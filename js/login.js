  // LOGIN LOGIC
  const API_BASE = "http://localhost:4000";

  function setError(msg){
    alert(msg); // swap later for inline UI message
  }

  async function login(){
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(!email || !password) return setError("Enter email and password.");

    try{
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // IMPORTANT so refresh cookie is stored
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if(!res.ok) return setError(data.error || "Login failed.");

      // Save access token for API calls (later: store in memory + refresh flow)
      localStorage.setItem("origin_access", data.accessToken);
      localStorage.setItem("origin_user", JSON.stringify(data.user));

      window.location.href = "dashboard.html";
    } catch(err){
      setError("Network error. Is the API running?");
    }
  }

  document.getElementById("signInBtn").addEventListener("click", login);

  // Optional: Enter key submits
  document.addEventListener("keydown", (e) => {
    if(e.key === "Enter") login();
  });
