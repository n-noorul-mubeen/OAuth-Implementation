import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CryptoJS from "crypto-js";

import RegistrationForm from "./RegistrationForm";

function App({ setIsAuthenticated, sendAccessTokenToRegistrationForm }) {
  const [userNameValue, setUserName] = useState("");
  const [passwordValue, setPassword] = useState("");
  const [ID, setID] = useState("");
  const navigate = useNavigate();

  const encrypt = (pass) => {
    const secretKey = CryptoJS.enc.Utf8.parse("1234567890123456");
    const iv = CryptoJS.enc.Utf8.parse("1234567890123456");
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(pass),
      secretKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  };

  const handleValidity = async (userName, accessToken) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/valid",
        { Username: userName },
        {
          headers: {
            "Content-Type": "application/json",
            AccessToken: accessToken,
          },
        }
      );
      return response.data.result;
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pass = encrypt(passwordValue);
      setID("");
      sendAccessTokenToRegistrationForm("");
      setIsAuthenticated(false);
      const response = await axios.post(
        "http://localhost:5000/generate",
        { Username: userNameValue, Password: pass },
        { headers: { "Content-Type": "application/json" } }
      );
      const accessToken = response.data.result;
      setID(accessToken);
      //sendAccessTokenToRegistrationForm(accessToken);
      localStorage.setItem("accessToken", accessToken);
      if (accessToken !== "INVALID ENTRY") {
        const validityResult = await handleValidity(userNameValue, accessToken);
        if (validityResult === 1) {
          setIsAuthenticated(true);
          navigate("/registration-form");
        }
      }
    } catch (error) {
      console.error("Error sending data to Flask:", error);
    }
  };

  const setDefault = () => {
    setID("");
    sendAccessTokenToRegistrationForm("");
  };

  const handleUserNameChange = (e) => {
    setDefault();
    setUserName(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setDefault();
    setPassword(e.target.value);
  };

  return (
    <div>
      <h1 style={{ color: "white" }}>Sign In</h1>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Username:</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
              <Form.Control
                type="text"
                onChange={handleUserNameChange}
                value={userNameValue}
                placeholder="Enter your Username"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              onChange={handlePasswordChange}
              value={passwordValue}
              placeholder="Enter Your Password"
            />
          </Form.Group>
        </Row>
        <Button
          variant={
            ID === "INVALID ENTRY"
              ? "danger"
              : ID === ""
              ? "primary"
              : "success"
          }
          type="submit"
        >
          Log In
        </Button>
      </Form>
    </div>
  );
}

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <App
                setIsAuthenticated={setIsAuthenticated}
                sendAccessTokenToRegistrationForm={setAccessToken}
              />
            }
          />
          <Route
            path="/registration-form"
            element={
              localStorage.getItem("accessToken") ? (
                <RegistrationForm
                  accessToken={accessToken}
                  handleAccessToken={setAccessToken}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default Main;
