import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/employees';

function App() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
    position: '',
    id: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL);
      setEmployees(response.data);
      console.log('Fetched employees:', response.data); // Debug log
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = async (e) => {
    const { id, value, files } = e.target;
    if (files) {
      const file = files[0];
      const base64 = await convertToBase64(file);
      setFormData({
        ...formData,
        [id]: base64
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
    console.log(`Changed ${id}:`, files ? files[0] : value); // Debug log
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data on submit:', formData); // Debug log

    if (isEditing) {
      try {
        await axios.put(`${API_URL}/${currentEmployeeId}`, formData);
        setEmployees(employees.map(emp => emp.id === currentEmployeeId ? formData : emp));
        setIsEditing(false);
        setCurrentEmployeeId(null);
        console.log('Updated employee:', formData); // Debug log
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    } else {
      try {
        const response = await axios.post(API_URL, formData);
        setEmployees([...employees, response.data]);
        console.log('Added employee:', response.data); // Debug log
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    }
    setFormData({
      name: '',
      email: '',
      phone: '',
      image: '',
      position: '',
      id: ''
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedEmployees = employees.filter(employee => employee.id !== id);
      setEmployees(updatedEmployees);
      console.log('Deleted employee with ID:', id); // Debug log
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEdit = (id) => {
    const employeeToEdit = employees.find(employee => employee.id === id);
    setFormData(employeeToEdit);
    setIsEditing(true);
    setCurrentEmployeeId(id);
    console.log('Editing employee:', employeeToEdit); // Debug log
  };

  const filteredEmployees = employees.filter(employee =>
    employee.id.includes(searchQuery)
  );

  return (
    <div className='container'>
      <h2>Employee Registration App</h2>
      <form onSubmit={handleSubmit}>
        <div className='labels'>
          <label htmlFor="name">Name</label><br />
          <input type="text" id='name' placeholder='Name' value={formData.name} onChange={handleInputChange} required /><br />

          <label htmlFor="email">Email Address</label><br />
          <input type="email" id='email' placeholder='Email Address' value={formData.email} onChange={handleInputChange} required /><br />

          <label htmlFor="phone">Phone number</label><br />
          <input type="tel" id='phone' placeholder='Phone number' value={formData.phone} onChange={handleInputChange} required /><br />

          <label htmlFor="image">Image</label><br />
          <input type="file" id='image' onChange={handleInputChange} /><br />

          <label htmlFor="position">Position</label><br />
          <input type="text" id='position' placeholder='Position' value={formData.position} onChange={handleInputChange} required /><br />

          <label htmlFor="id">ID</label><br />
          <input type="text" id='id' placeholder='ID' value={formData.id} onChange={handleInputChange} required /><br />
        </div>
        <div className='button'>
          <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
        </div>
      </form>

      <div className='search'>
        <h3>Search Employees by ID</h3>
        <input type="text" placeholder="Search by ID" value={searchQuery} onChange={handleSearch} />
      </div>

      <div className='employee-list'>
        <h3>Employee List</h3>
        {filteredEmployees.length > 0 ? (
          <ul>
            {filteredEmployees.map((employee, index) => (
              <li key={index}>
                <p>Name: {employee.name}</p>
                <p>Email: {employee.email}</p>
                <p>Phone: {employee.phone}</p>
                <p>Position: {employee.position}</p>
                <p>ID: {employee.id}</p>
                {employee.image && <img src={employee.image} alt={`${employee.name}'s avatar`} width="100" />}
                <button onClick={() => handleEdit(employee.id)}>Edit</button>
                <button onClick={() => handleDelete(employee.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No employees found</p>
        )}
      </div>
    </div>
  );
}

export default App;

