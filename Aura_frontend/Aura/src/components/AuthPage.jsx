import React, { useState } from 'react'
import './AuthPage.css'
import logo from '../assets/logo.png'
import { Navigate, useNavigate } from 'react-router-dom'
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (isLogin) {
            if (!formData.email) {
                newErrors.email = 'Email is required'
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid'
            }
            if (!formData.password) {
                newErrors.password = 'Password is required'
            }
        } else {
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required'
            }
            if (!formData.email) {
                newErrors.email = 'Email is required'
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid'
            }
            if (!formData.password) {
                newErrors.password = 'Password is required'
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters'
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            // Handle form submission here
            console.log('Form submitted:', formData)
            alert(isLogin ? 'Login successful!' : 'Signup successful!')
            navigate('/home')
        }
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        })
        setErrors({})
    }
    
    return (
        <div className="auth-container">
            <div className="auth-content">
                {/* Logo/Brand Section */}
                <div className="brand-section">
                    <div className="logo-circle">
                        <img
                            src={logo}
                            alt="Aura Logo"
                            className="logo-image"
                        />
                    </div>
                    <h1 className="brand-name">Aura</h1>
                    <p className="brand-tagline">Welcome to your journey</p>
                </div>

                {/* Form Container */}
                <div className={`form-wrapper ${isLogin ? 'login-mode' : 'signup-mode'}`}>
                    {/* Toggle Buttons */}
                    <div className="mode-toggle">
                        <button
                            className={`toggle-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => !isLogin && toggleMode()}
                        >
                            Sign In
                        </button>
                        <button
                            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                            onClick={() => isLogin && toggleMode()}
                        >
                            Sign Up
                        </button>
                        <div className={`toggle-indicator ${isLogin ? 'left' : 'right'}`}></div>
                    </div>

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group name-field">
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" />
                                        <path d="M10 12C5.58172 12 2 14.6863 2 18V20H18V18C18 14.6863 14.4183 12 10 12Z" fill="currentColor" />
                                    </svg>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className={`form-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                {isLogin ? 'Username' : 'Email Address'}
                            </label>
                            <div className="input-wrapper">
                                {isLogin ? (
                                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" />
                                        <path d="M10 12C5.58172 12 2 14.6863 2 18V20H18V18C18 14.6863 14.4183 12 10 12Z" fill="currentColor" />
                                    </svg>
                                ) : (
                                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    </svg>
                                )}
                                <input
                                    type={isLogin ? 'text' : 'email'}
                                    id="email"
                                    name="email"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder={isLogin ? 'Enter your username' : 'Enter your email'}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 9.16667V5.83333C15 3.53215 13.1348 1.66667 10.8333 1.66667H9.16667C6.86548 1.66667 5 3.53215 5 5.83333V9.16667M10.8333 14.1667V16.6667M5 9.16667H15C16.3807 9.16667 17.5 10.286 17.5 11.6667V15.8333C17.5 17.214 16.3807 18.3333 15 18.3333H5C3.61929 18.3333 2.5 17.214 2.5 15.8333V11.6667C2.5 10.286 3.61929 9.16667 5 9.16667Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                </svg>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89131 8.77535 7.5 9.40802 7.5 10.2083C7.5 11.8088 8.69149 13 10.2917 13C11.092 13 11.7246 12.6087 12.1667 12.1667M5.20833 5.20833C3.925 6.125 2.91667 7.5 2.5 9.16667C3.33333 12.0833 6.25 14.1667 10 14.1667C11.0417 14.1667 12.0083 13.9667 12.875 13.7083M13.75 10.2083C13.75 8.60802 12.5585 7.41667 10.9583 7.41667" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                            <path d="M10 5.83333C12.5 5.83333 14.5833 6.875 16.25 8.33333L17.5 9.16667C16.6667 12.0833 13.75 14.1667 10 14.1667" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M2.5 9.16667C3.33333 12.0833 6.25 14.1667 10 14.1667C13.75 14.1667 16.6667 12.0833 17.5 9.16667C16.6667 6.25 13.75 4.16667 10 4.16667C6.25 4.16667 3.33333 6.25 2.5 9.16667Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                            <circle cx="10" cy="9.16667" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm Password
                                </label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15 9.16667V5.83333C15 3.53215 13.1348 1.66667 10.8333 1.66667H9.16667C6.86548 1.66667 5 3.53215 5 5.83333V9.16667M10.8333 14.1667V16.6667M5 9.16667H15C16.3807 9.16667 17.5 10.286 17.5 11.6667V15.8333C17.5 17.214 16.3807 18.3333 15 18.3333H5C3.61929 18.3333 2.5 17.214 2.5 15.8333V11.6667C2.5 10.286 3.61929 9.16667 5 9.16667Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    </svg>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89131 8.77535 7.5 9.40802 7.5 10.2083C7.5 11.8088 8.69149 13 10.2917 13C11.092 13 11.7246 12.6087 12.1667 12.1667M5.20833 5.20833C3.925 6.125 2.91667 7.5 2.5 9.16667C3.33333 12.0833 6.25 14.1667 10 14.1667C11.0417 14.1667 12.0083 13.9667 12.875 13.7083M13.75 10.2083C13.75 8.60802 12.5585 7.41667 10.9583 7.41667" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                                <path d="M10 5.83333C12.5 5.83333 14.5833 6.875 16.25 8.33333L17.5 9.16667C16.6667 12.0833 13.75 14.1667 10 14.1667" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M2.5 9.16667C3.33333 12.0833 6.25 14.1667 10 14.1667C13.75 14.1667 16.6667 12.0833 17.5 9.16667C16.6667 6.25 13.75 4.16667 10 4.16667C6.25 4.16667 3.33333 6.25 2.5 9.16667Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                                <circle cx="10" cy="9.16667" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>
                        )}

                        {isLogin && (
                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" className="checkbox-input" />
                                    <span className="checkbox-text">Remember me</span>
                                </label>
                                <a href="#" className="forgot-link">Forgot password?</a>
                            </div>
                        )}

                        <button type="submit" className="submit-button" >
                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AuthPage
