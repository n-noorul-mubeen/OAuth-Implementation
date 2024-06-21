import React, { useEffect, useState, useCallback } from "react";
import $ from "jquery";
import "datatables.net-bs4";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import { Table, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegistrationForm({ accessToken, handleAccessToken }) {
  // const [accessToken, setAccessToken] = useState("");
  const [tableData, setTableData] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState("male");
  const [nationality, setNationality] = useState("United Arab Emirates");
  const [address, setAddress] = useState("");
  const [internationalAddress, setInternationalAddress] = useState("");
  const [countryCode, setCountryCode] = useState("44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("IT");
  const navigate = useNavigate();

  const handleDelete = useCallback(
    (index) => {
      const newData = [...tableData];
      newData.splice(index, 1);
      setTableData(newData);
    },
    [tableData]
  );

  const handleEdit = useCallback(
    (index) => {
      if (tableData[index]) {
        setEditIndex(index);
        const {
          name,
          fatherName,
          gender,
          nationality,
          address,
          internationalAddress,
          phone,
          email,
          dept,
        } = tableData[index];
        setName(name);
        setFatherName(fatherName);
        setGender(gender);
        setNationality(nationality);
        setAddress(address);
        setInternationalAddress(internationalAddress);
        const [countryCodeValue, phoneNumberValue] = phone.split(" ");
        setCountryCode(countryCodeValue);
        setPhoneNumber(phoneNumberValue);
        setEmail(email);
        setDept(dept);
      }
    },
    [tableData]
  );

  useEffect(() => {
    const table = $("#dataTable").DataTable({
      paging: true,
      searching: true,
      ordering: true,
      data: tableData,
      columns: [
        { title: "Name", data: "name" },
        { title: "Father Name", data: "fatherName" },
        { title: "Gender", data: "gender" },
        { title: "Nationality", data: "nationality" },
        { title: "Local Address", data: "address" },
        { title: "International Address", data: "internationalAddress" },
        { title: "Phone", data: "phone" },
        { title: "Email", data: "email" },
        { title: "Department", data: "dept" },
        {
          title: "Action",
          data: null,
          render: function (data, type, row, meta) {
            return `
              <div>
                <button class="btn btn-danger delete-btn" data-index="${meta.row}">Delete</button>
                <button class="btn btn-primary edit-btn" data-index="${meta.row}">Edit</button>
              </div>
            `;
          },
        },
      ],
    });

    $("#dataTable").on("click", ".delete-btn", function () {
      const rowIndex = $(this).data("index");
      handleDelete(rowIndex);
    });

    $("#dataTable").on("click", ".edit-btn", function () {
      const rowIndex = $(this).data("index");
      handleEdit(rowIndex);
    });

    return () => {
      table.destroy();
      $("#dataTable").off("click", ".delete-btn");
      $("#dataTable").off("click", ".edit-btn");
    };
  }, [tableData, handleDelete, handleEdit]);

  const clear = () => {
    setName("");
    setFatherName("");
    setGender("male");
    setNationality("United Arab Emirates");
    setAddress("");
    setInternationalAddress("");
    setCountryCode("44");
    setPhoneNumber("");
    setDept("IT");
    setEmail("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    clear();
    const formData = new FormData(event.target);
    const newRowData = {
      name: formData.get("name"),
      fatherName: formData.get("fathername"),
      gender: formData.get("gender"),
      nationality: formData.get("nationality"),
      address: formData.get("address"),
      internationalAddress: formData.get("international-address"),
      phone: `${countryCode} ${formData.get("phone")}`,
      email: formData.get("email-addr"),
      dept: formData.get("dept"),
    };
    if (editIndex === -1) {
      setTableData([...tableData, newRowData]);
    } else {
      const updatedTableData = [...tableData];
      updatedTableData[editIndex] = newRowData;
      setTableData(updatedTableData);
      setEditIndex(-1);
    }
    event.target.reset();
  };

  const handleLogOut = async () => {
    try {
      localStorage.clear();
      const response = await axios.post(
        "http://localhost:5000/log-out",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            AccessToken: accessToken,
          },
        }
      );
      if (response.data.result === "Access Token Deleted") {
        navigate("/");
      }
    } catch (error) {
      console.log("Error sending data to Flask: ", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 style={{ color: "white" }}>Registration Form:</h1>
      <Form id="register" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col mb-6">
            <label htmlFor="name" className="col-sm-2 col-form-label">
              <span className="req">*</span>Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col md-6">
            <label htmlFor="fathername" className="col-sm-2 col-form-label">
              <span className="req">*</span>Father&nbsp;Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fathername"
              name="fathername"
              placeholder="Enter your father name"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              required
            />
          </div>
          <div className="col-12"></div>
          <fieldset className="col ms-6">
            <legend className="col-form-label col-sm-2 pt-0">
              <span className="req">*</span>Gender
            </legend>
            <div className="col-12">
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  id="male"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />
                <label htmlFor="male" className="form-check-label">
                  Male
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  id="female"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />
                <label htmlFor="female" className="form-check-label">
                  Female
                </label>
              </div>
            </div>
          </fieldset>
          <div className="col md-3">
            <label htmlFor="nationality">
              <span className="req">*</span>Nationality
            </label>
            <select
              name="nationality"
              id="nationality"
              className="form-control form-select col-2"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            >
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Aruba">Aruba</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Belarus">Belarus</option>
              <option value="Belgium">Belgium</option>
              <option value="Zimbabwe">Zimbabwe</option>
            </select>
          </div>
          <div className="col-12"></div>
          <div className="col mb-6">
            <label htmlFor="address" className="col-sm-4 col-form-label">
              <span className="req">*</span>Local&nbsp;Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="col mb-6">
            <label
              htmlFor="international-address"
              className="col-sm-8 col-form-label"
            >
              International Address
            </label>
            <input
              type="text"
              className="form-control"
              id="international-address"
              name="international-address"
              placeholder="Enter your international address"
              value={internationalAddress}
              onChange={(e) => setInternationalAddress(e.target.value)}
            />
          </div>
          <div className="col-12"></div>
          <div className="col mb-6">
            <label htmlFor="phone" className="col-sm-4 col-form-label">
              <span className="req">*</span>Phone Number
            </label>
            <div className="row g-5">
              <div className="col-md-3">
                <select
                  name="country-code"
                  id="country-code"
                  className="custom-select form-select input-small"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                >
                  <optgroup label="Country Code">
                    <option data-countrycode="GB" value="+44">
                      UK (+44)
                    </option>
                    <option data-countrycode="US" value="+1">
                      USA (+1)
                    </option>
                    <option data-countrycode="DZ" value="+213">
                      Algeria (+213)
                    </option>
                    <option data-countrycode="AD" value="+376">
                      Andorra (+376)
                    </option>
                    <option data-countrycode="AO" value="+244">
                      Angola (+244)
                    </option>
                    <option data-countrycode="AI" value="+1264">
                      Anguilla (+1264)
                    </option>
                    <option data-countrycode="AG" value="+1268">
                      Antigua & Barbuda (+1268)
                    </option>
                    <option data-countrycode="AR" value="+54">
                      Argentina (+54)
                    </option>
                    <option data-countrycode="AM" value="+374">
                      Armenia (+374)
                    </option>
                    <option data-countrycode="AW" value="+297">
                      Aruba (+297)
                    </option>
                    <option data-countrycode="AU" value="+61">
                      Australia (+61)
                    </option>
                    <option data-countrycode="AT" value="+43">
                      Austria (+43)
                    </option>
                    <option data-countrycode="AZ" value="+994">
                      Azerbaijan (+994)
                    </option>
                    <option data-countrycode="BS" value="+1242">
                      Bahamas (+1242)
                    </option>
                    <option data-countrycode="BH" value="+973">
                      Bahrain (+973)
                    </option>
                    <option data-countrycode="BD" value="+880">
                      Bangladesh (+880)
                    </option>
                  </optgroup>
                </select>

                {/* <input
                  type="text"
                  className="form-control"
                  id="country-code"
                  name="country-code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                /> */}
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="col mb-6">
            <label htmlFor="email-addr" className="col-sm-4 col-form-label">
              <span className="req">*</span>Email&nbsp;Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email-addr"
              name="email-addr"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col mb-6">
            <label htmlFor="dept" className="col-sm-4 col-form-label">
              <span className="req">*</span>Department
            </label>
            <select
              name="dept"
              id="dept"
              className="form-control form-select col-2"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              required
            >
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="col-12">
            <Button type="submit" className="btn btn-primary mt-3">
              {editIndex === -1 ? "Register" : "Update"}
            </Button>
          </div>
        </div>
      </Form>
      <div className="container mt-4">
        <Table
          striped
          bordered
          hover
          className="table table-bordered"
          id="dataTable"
        ></Table>
      </div>
      <Button
        type="button"
        className="btn btn-primary mt-3"
        onClick={handleLogOut}
      >
        Log Out
      </Button>
    </div>
  );
}

export default RegistrationForm;
