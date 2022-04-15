import React, { useEffect, useState } from 'react';
import { ReactDOM } from 'react-dom';
import axios from 'axios';
import formik, { Formik } from 'formik';

function Application() {
    let [userData, setUserData] = useState({
        id: "",
        first_name: "",
        email: "",
    });
    let [users, setUsers] = useState([]);

    useEffect(async () => {
        users = await axiosFn(`https://reqres.in/api/users`, 'get', {});
        console.log(users);
        setUsers(users.data.data);
        return;
    }, []);
   

    let handleChange = (e) => {
        userData[e.target.name] = e.target.value.toString();
        setUserData({
            id: userData.id,
            first_name: userData.first_name,
            email: userData.email,
        });
    }

    const handleSubmit = async (userData,resetForm) => {
       // e.preventDefault();
        console.log(userData);
        if (userData.email != "" && userData.name != "") {
            const filterRecord = users.filter((row) => {
                if (row.email == userData.email) {
                    return row;
                }
            });
            debugger;
            let userRecord;
            if (filterRecord.length == 0) {
                console.log("Insert");

                let usersCreate = await axiosFn(`https://reqres.in/api/users`, 'post', {
                    "name": userData.first_name,
                    "job": "leader",
                    "email": userData.email
                });
                debugger;
                userRecord = [...users];
                userRecord.push({
                    first_name: userData.first_name,
                    id: usersCreate.data.id,
                    email: userData.email,
                });
                setUsers(userRecord)
                setUserData({
                    id: "",
                    first_name: "",
                    email: "",
                })
            } else {
                console.log("Update");
                let usersUpdate = await axiosFn(`https://reqres.in/api/users/${filterRecord[0].id}`, 'put', {
                    "name": userData.first_name,
                    "job": "leader",
                    "email": userData.email
                });
                users.forEach((row) => {
                    if (row.id == filterRecord[0].id) {
                        row.first_name = usersUpdate.data.name;
                        row.email = usersUpdate.data.email;
                    }
                })
                setUsers(users)
                
                debugger;
            }  
            resetForm({values:""});    
        } else {
            console.error("Please fill all the input details")
        }

    }         
    
    const onEditFunction = (e, values) => {        
        console.log("onEdit");        
        debugger;
        const filterRecord = users.filter((row) => {
            if (row.id == e.target.parentElement.parentElement.children[0].innerText) {
                return row;
            }
        });

        if (filterRecord.length) {
            console.log("update call");
            console.log(values);
            values.email = filterRecord[0].email;
            values.first_name = filterRecord[0].first_name;
            values.id = filterRecord[0].id; 
            setUserData({});                  
        }
    }

    const onDeleteFunction = async (e) => {
        console.log("onDelete");
        debugger;
        const filterRecord = users.filter((row) => {
            if (row.id == e.target.parentElement.parentElement.children[0].innerText) {
                return row;
            }
        });
        let usersDelete = await axiosFn(`https://reqres.in/api/users/${filterRecord[0].id}`, 'delete', {});
        let userDeleterFilter = [];
        users.forEach((row) => {
            if (row.id != filterRecord[0].id) {
                return userDeleterFilter.push(row);
            }
        })
        setUsers(userDeleterFilter);
        debugger;
    }
    
    let handleErrors = (values)=>{
        //console.log("hgh: "+values);
        const errors = {};
            if (!values.email) {
                errors.email = 'Required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Invalid email address';
            }                      
            
            if (!values.first_name) {
                errors.first_name = 'Required';
            }
            return errors;
    }
    
    let onTableCreate = () => {        

        return (
            <>
                <Formik
                    initialValues={{ email: '', first_name: '' }}
                    validate={(values) => handleErrors(values)}
                    onSubmit={(values, { setSubmitting, resetForm}) => {
                        console.log("call");
                        handleSubmit(values, resetForm);
                        setSubmitting(false);
                        
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,                        
                        isSubmitting,  
                                          
                    }) => (
                        <>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label>Name</label>
                                    <input type="text"
                                    name="first_name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.first_name}></input>
                                    <span style={{color:'red'}}>{errors.first_name && touched.first_name && errors.first_name}</span>
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input type="email"
                                        name="email"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}></input>
                                    <span style={{color:'red'}}>{errors.email && touched.email && errors.email}</span>
                                </div>
                                <div>
                                    <button type="submit" disabled={isSubmitting}>Submit</button>
                                </div>
                            </form><br /><br />
                            <table>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((row) => {
                                        return (
                                            <>
                                                <tr>
                                                    <td>{row.id}</td>
                                                    <td>{row.first_name}</td>
                                                    <td>{row.email}</td>
                                                    <td>
                                                        <button onClick={(e) => onEditFunction(e, values)}>Edit</button>&nbsp;&nbsp;
                                                        <button onClick={(e) => onDeleteFunction(e, values)}>Delete</button>&nbsp;
                                                    </td>
                                                </tr>
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}
                </Formik>
            </>
        );
    }

    return (
        <>
            {onTableCreate()}
        </>
    );
}

const axiosFn = async (url, method, request) => {
    //console.log(url + " " + method + " " + request);
    let response;
    try {
        switch (method) {
            case 'get':
                response = await axios.get(url, request);
                console.log("called")
                break;
            case 'put':
                response = await axios.put(url, request);
                break;
            case 'post':
                response = await axios.post(url, request);
                break;
            case 'delete':
                response = await axios.delete(url, request);
                break;
        }
    } catch (e) {
        console.error(e);
    }

    return response;
}

export default Application;