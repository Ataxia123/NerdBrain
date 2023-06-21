import React, { ChangeEvent } from "react";
import { Input } from "@mui/material";

interface InputFieldProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  color?: string;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ value, onChange, label, color = "white", type = "text" }) => (
  <>
    {label && (
      <>
        {label}
        <br />
      </>
    )}
    <Input
      value={value}
      onChange={onChange}
      type={type}
      style={{
        color,
        width: "80%",
        marginLeft: "15%",
        border: `${color} 2px solid`,
        borderRadius: "5px",
      }}
    />
    <br />
  </>
);

export default InputField;
