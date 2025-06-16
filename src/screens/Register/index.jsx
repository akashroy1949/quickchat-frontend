import React from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";

const RegisterSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        )
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password")
});

const CustomInput = ({ field, form: { touched, errors }, ...props }) => (
    <div className="relative">
        <div className="relative">
            <Input
                {...field}
                {...props}
                className={`w-full bg-dark-input text-white transition-all duration-200 ease-in-out ${
                    touched[field.name] && errors[field.name] 
                    ? 'border-red-500/80 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/30 shake-animation' 
                    : 'border-gray-800 hover:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
            />
            {touched[field.name] && errors[field.name] && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
        <div className="min-h-[1.5rem]">
            {touched[field.name] && errors[field.name] && (
                <p className="mt-1 text-sm text-red-400 slide-up-fade-in flex items-center gap-1.5">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{errors[field.name]}</span>
                </p>
            )}
        </div>
    </div>
);

CustomInput.propTypes = {
    field: PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onBlur: PropTypes.func.isRequired
    }).isRequired,
    form: PropTypes.shape({
        touched: PropTypes.object.isRequired,
        errors: PropTypes.object.isRequired
    }).isRequired
};

const RegisterScreen = () => {
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // TODO: Implement registration logic with API call
            console.log("Form submitted:", values);
        } catch (error) {
            console.error("Registration failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 font-sans">
            <Card className="w-full max-w-md bg-dark-card border border-gray-800 p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-6 text-center text-white font-display tracking-tight">
                    Create an Account
                </h2>
                <Formik
                    initialValues={{
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: ""
                    }}
                    validationSchema={RegisterSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <Field
                                name="username"
                                placeholder="Username"
                                type="text"
                                component={CustomInput}
                            />
                            <Field
                                name="email"
                                placeholder="Email"
                                type="email"
                                component={CustomInput}
                            />
                            <Field
                                name="password"
                                placeholder="Password"
                                type="password"
                                component={CustomInput}
                            />
                            <Field
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                type="password"
                                component={CustomInput}
                            />
                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating Account..." : "Sign Up"}
                            </Button>
                        </Form>
                    )}
                </Formik>
                <div className="mt-6 text-center text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
                        Log in
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterScreen;
