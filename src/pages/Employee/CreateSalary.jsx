import React from 'react'
import { useLocation } from "react-router-dom";

const location = useLocation();
const employeeId = location.state?.employeeId;

const CreateSalary = () => {
  return (
    <div>CreateSalary</div>
  )
}

export default CreateSalary