import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUserAction } from "@/redux/actions/Login/loginUserAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

const CustomInput = ({ field, form: { touched, errors }, label, ...props }) => (
    <div className="relative">
        <label htmlFor={field.name} className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
            {label}
        </label>
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
    }).isRequired,
    label: PropTypes.string.isRequired
};

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
});

const LoginForm = () => {
    const dispatch = useDispatch();
    const loginData = useSelector((state) => state.loginUser);
    const loginLoading = loginData?.loading;

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await dispatch(
                loginUserAction(
                    values,
                    (data) => {
                        toast.success("Login successful");
                        data?.data && console.log("User Data:", data.data);
                        // You can redirect here e.g. navigate("/chat")
                    },
                    (err) => {
                        toast.error(err);
                    }
                )
            );
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={{
                email: "",
                password: "",
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className="space-y-5">
                    <Field
                        name="email"
                        type="email"
                        component={CustomInput}
                        label="Email"
                    />
                    <Field
                        name="password"
                        type="password"
                        component={CustomInput}
                        label="Password"
                    />
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting || loginLoading}
                    >
                        {(isSubmitting || loginLoading) ? "Signing in..." : "Sign in"}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

export default LoginForm;
