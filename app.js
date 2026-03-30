/**
 * Quantity Measurement App Frontend Integration
 * 
 * Update API_BASE_URL to match your Spring Boot application's URL and port.
 */
const API_BASE_URL = "http://localhost:8080"; // Replace with your actual backend URL

// Handle Google OAuth2 Login
const googleLoginBtn = document.getElementById("google-login-btn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    // Redirect the browser to the Spring Boot Google OAuth2 authorization endpoint
    // Spring Boot will handle the redirect to Google's consent screen
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  });
}

// Handle Google OAuth2 Signup
const googleSignupBtn = document.getElementById("google-signup-btn");
if (googleSignupBtn) {
  googleSignupBtn.addEventListener("click", () => {
    // Signup is exactly the same flow as login with OAuth2
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  });
}
