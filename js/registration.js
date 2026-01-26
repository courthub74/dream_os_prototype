
  const API_BASE = "http://localhost:4000";

  function setError(msg){
    alert(msg); // swap to inline message later
  }

  async function register(){
  // ⛔ Prevent double-submit immediately
  const btn = document.getElementById("createAccountBtn");
  btn.disabled = true;
  btn.style.opacity = "0.7";
  btn.style.cursor = "not-allowed";

  try {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value;
    const pass2 = document.getElementById("regPass2").value;
    const agreed = document.getElementById("agreeTerms").checked;

    if(!name) throw "Enter your name.";
    if(!email) throw "Enter your email.";
    if(pass.length < 8) throw "Password must be at least 8 characters.";
    if(pass !== pass2) throw "Passwords do not match.";
    if(!agreed) throw "You must agree to the terms.";

    // 1) Register
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password: pass })
    });

    const regData = await regRes.json();
    if(!regRes.ok) throw regData.error || "Registration failed.";

    // 2) Auto-login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password: pass })
    });

    const loginData = await loginRes.json();
    if(!loginRes.ok) throw loginData.error || "Login failed.";

    localStorage.setItem("origin_access", loginData.accessToken);
    localStorage.setItem("origin_user", JSON.stringify(loginData.user));

    window.location.href = "dashboard.html";

  } catch(err){
    alert(typeof err === "string" ? err : "Network error.");

  } finally {
    // 🔓 Always re-enable button
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.cursor = "";
  }
}


  document.getElementById("createAccountBtn").addEventListener("click", register);

  // Optional: Enter key submits
  document.addEventListener("keydown", (e) => {
    if(e.key === "Enter") register();
  });

