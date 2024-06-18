"use client"

import { useState } from 'react';
import '../login/login.css'
import 'boxicons/css/boxicons.min.css';
import { useSearchParams } from 'next/navigation'
import { login, signup, googleAuth } from './actions';

const LoginContent = () => {

    const searchParams = useSearchParams()
    const isSignup = searchParams.get('isSignup')

    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignup == 'true') {
            const data = {
                email: email,
                password: password,
                confirm: confirm,
                name: name
            }
            signup(data)
        } else {
            const data = {
                email: email,
                password: password
            }
            login(data)
        }
    };
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmChange = (e) => {
        setConfirm(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleGoogleLogin = async () => {
        console.log("Google button clicked")
        const response = googleAuth();
        console.log(response)
      };
    
    return (
        <main>
            <div className='container'>
                <div className='card'>
                    {isSignup == 'true' ? (
                        <h1 className='title'>Sign Up</h1>
                    ) : (
                        <h1 className='title'>Login</h1>
                    )}
                    <div className="">
                        <form className="form" onSubmit={handleSubmit}>
                            <div>
                                <input type="email" name="email" id="email" onChange={(event) => handleEmailChange(event)} className="email_input" placeholder="Your email" required=""/>
                            </div>
                            <div>
                                <input type="password" name="password" id="password" onChange={(event) => handlePasswordChange(event)} placeholder="Your password" className="pass_input" required=""/>
                            </div>
                            {isSignup == 'true' && (
                                <div>
                                    <input type="password" name="confirm" id="confirm" onChange={(event) => handleConfirmChange(event)} placeholder="Confirm password" className="pass_input" required=""/>
                                </div>
                            )}
                            {isSignup == 'true' && (
                                <div>
                                    <input type='text' name="name" id="name" onChange={(event) => handleNameChange(event)} className="name_input" placeholder="Your first name" required=""/>
                                </div>
                            )}
                            {isSignup == 'true' ? (
                                <button type="submit" disabled={!email.trim() || !password.trim()} className="login_button">Sign Up</button>
                            ) : (
                                <button type="submit" disabled={!email.trim() || !password.trim()} className="login_button">Login</button>
                            )}
                        </form>
                    </div>
                    {isSignup == 'true' ? (
                        <div className="forgot">
                            <a href="/login?isSignup=false" className="">Already have an account?</a>
                        </div>
                    ) : (
                        <div className="forgot">
                            <a href="#" className="">Forgot password?</a>
                        </div>
                    )}
                    
                    <button className='googleButton' onClick={handleGoogleLogin}>
                        <i className='bx bxl-google bx'></i>
                    </button>
                </div>
            </div>
        </main>
      );
};

export default LoginContent