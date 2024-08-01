import React, { useState, useRef } from "react";

const OtpInput = ({ length, onChangeOTP }) => {
  const [otp, setOTP] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.match(/^[0-9]$/)) {
      const newOTP = [...otp];
      newOTP[index] = value;
      setOTP(newOTP);
      if (index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
      onChangeOTP(newOTP.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "") {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        const newOTP = [...otp];
        newOTP[index] = "";
        setOTP(newOTP);
        onChangeOTP(newOTP.join(""));
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (e.key === "Delete" && index < length - 1) {
        if (otp[index] === "") {
            if (index > 0) {
              inputRefs.current[index - 1].focus();
            }
          } else {
            const newOTP = [...otp];
            newOTP[index] = "";
            setOTP(newOTP);
            onChangeOTP(newOTP.join(""));
          }
        }
  };

  return (
    <div style={{display:"flex", gap: "8px", alignContent:"center", justifyContent:"center" }}>
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={{
            width: "40px",
            height: "40px",
            textAlign: "center",
            fontSize: "24px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            outline: "none",
            boxShadow: "0 0 0 2px #FFFFFF"
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
