import React, { useState } from "react";
import { register, login } from '../api/api.js';  
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext'; 
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [name, setName] = useState("");  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const { login: loginUser } = useUser();  
  const showToast = useToast();

  // Email validation regex
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  //Generate profile picture
  const generateProfilePicture = (username) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    canvas.width = 100;
    canvas.height = 100;
  
    // Random background color
    const colors = ["#FF5733", "#FFFA66", "#3357FF", "#FF33A8", "#F4A261"];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
  
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw text (first letter of username)
    ctx.fillStyle = "#FFF";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(username.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);
  
    return canvas.toDataURL(); // Returns the image as a Base64 string
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate inputs
    if (!name || !email || !password) {
      showToast("Please fill in all fields", 'error');
      setLoading(false);
      return;
    }

    // Email validation
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", 'error');
      setLoading(false);
      return;
    }

    const profileImage = generateProfilePicture(name);

    try {
      const response = await register(name, email, password, profileImage);
      
      if (response.id) {
        const loginResponse = await login(email, password); 
        
        if (loginResponse && loginResponse.user) {
          loginUser(loginResponse.user);  

          // Navigate immediately
          navigate("/", { 
            state: { 
              toast: { 
                message: "Successful registration and login!", 
                type: 'success' 
              } 
            },
            replace: false
          });
        } else {
          showToast("An error occurred during login", 'error');
        }
      } else {
        showToast("An error occurred during registration", 'error');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showToast("This email is already registered. Please try another one", 'error');
      } else {
        showToast("An error occurred during registration", 'error');
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      {/* Toast Notification Container */}
      <ToastContainer />

      <Box
        sx={{
          backgroundColor: "white",
          boxShadow: 3,
          borderRadius: 3,
          padding: 4,
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Registration
        </Typography>

        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}  
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
            sx={{ padding: "12px", fontSize: "16px", mt: 2 }}
          >
            {loading ? "Registration..." : "Register"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#2e7d32", fontWeight: "bold" }}>
            Log in!
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;