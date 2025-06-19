import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUserAction } from "@/redux/actions/Login/registerUserAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

// Memoized icons to prevent recreation
const INPUT_ICONS = {
    name: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
    ),
    password: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    error: (
        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    ),
    success: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    errorSmall: (
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
    ),
    eyeOpen: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    eyeClosed: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    )
};

const CustomInput = React.memo(({ field, form: { touched, errors }, label, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Memoize computed values
    const hasError = touched[field.name] && errors[field.name];
    const hasValue = field.value;
    const isValid = touched[field.name] && !errors[field.name] && hasValue;
    const isPasswordField = props.type === 'password';

    const boxShadow = useMemo(() => {
        if (hasError) {
            return '0 0 0 1px rgba(248, 113, 113, 0.2), 0 0 20px rgba(248, 113, 113, 0.1)';
        } else if (hasValue) {
            return '0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)';
        }
        return 'none';
    }, [hasError, hasValue]);

    const inputClassName = useMemo(() => {
        const baseClasses = 'custom-input-field w-full bg-white/5 backdrop-blur-sm border text-white placeholder-white/40 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-0';
        const errorClasses = 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:bg-red-500/15 shake-animation';
        const normalClasses = 'border-white/20 hover:border-white/30 focus:border-purple-400/60 focus:bg-white/10 hover:bg-white/8';

        return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
    }, [hasError]);

    const getIcon = () => {
        if (props.type === 'email') return INPUT_ICONS.email;
        if (props.type === 'password') return INPUT_ICONS.password;
        if (field.name === 'name') return INPUT_ICONS.name;
        return INPUT_ICONS.email;
    };

    return (
        <div className="relative group">
            <label htmlFor={field.name} className="block text-sm font-medium mb-2 text-white/90 group-focus-within:text-white transition-colors duration-200">
                {label}
            </label>
            <div className="relative">
                <Input
                    {...field}
                    {...props}
                    type={isPasswordField && showPassword ? 'text' : props.type}
                    className={inputClassName}
                    style={{
                        boxShadow,
                        paddingLeft: '2.5rem',
                        paddingRight: isPasswordField ? '5rem' : '2.5rem'
                    }}
                />

                {/* Input Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors duration-200">
                    {getIcon()}
                </div>

                {/* Password Toggle Button */}
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors duration-200 p-1 rounded-md hover:bg-white/5"
                    >
                        {showPassword ? INPUT_ICONS.eyeClosed : INPUT_ICONS.eyeOpen}
                    </button>
                )}

                {/* Status Icons */}
                {hasError && !isPasswordField && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        {INPUT_ICONS.error}
                    </div>
                )}

                {hasError && isPasswordField && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        {INPUT_ICONS.error}
                    </div>
                )}

                {isValid && !isPasswordField && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        {INPUT_ICONS.success}
                    </div>
                )}

                {isValid && isPasswordField && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        {INPUT_ICONS.success}
                    </div>
                )}
            </div>

            {/* Error Message */}
            <div className="min-h-[1.5rem]">
                {hasError && (
                    <p className="mt-2 text-sm text-red-300 slide-up-fade-in flex items-center gap-2 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                        {INPUT_ICONS.errorSmall}
                        <span>{errors[field.name]}</span>
                    </p>
                )}
            </div>
        </div>
    );
});

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
    label: PropTypes.string.isRequired,
    type: PropTypes.string
};

// Memoized loading spinner
const LoadingSpinner = React.memo(() => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
));

// Memoized arrow icon
const ArrowIcon = React.memo(() => (
    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
));

const RegisterForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const registerData = useSelector((state) => state.registerUser);
    const registerLoading = registerData?.loading;

    const handleSubmit = useCallback(async (values, { setSubmitting }) => {
        try {
            await dispatch(
                registerUserAction(
                    {
                        name: values.name,
                        email: values.email,
                        password: values.password
                    },
                    () => {
                        toast.success("Registration successful! Please login to continue.");
                        navigate("/login");
                    },
                    (err) => {
                        toast.error(err);
                    }
                )
            );
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setSubmitting(false);
        }
    }, [dispatch, navigate]);

    return (
        <Formik
            initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .min(3, "Name must be at least 3 characters")
                    .required("Name is required"),
                email: Yup.string()
                    .email("Please enter a valid email address")
                    .required("Email is required"),
                password: Yup.string()
                    .min(8, "Password must be at least 8 characters")
                    .matches(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        "Password must contain uppercase, lowercase, number and special character"
                    )
                    .required("Password is required"),
                confirmPassword: Yup.string()
                    .oneOf([Yup.ref("password"), null], "Passwords must match")
                    .required("Please confirm your password")
            })}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <Form className="space-y-6">
                    <Field
                        name="name"
                        type="text"
                        component={CustomInput}
                        label="Full Name"
                        placeholder="Enter your full name"
                    />
                    <Field
                        name="email"
                        type="email"
                        component={CustomInput}
                        label="Email Address"
                        placeholder="Enter your email"
                    />
                    <Field
                        name="password"
                        type="password"
                        component={CustomInput}
                        label="Password"
                        placeholder="Create a password"
                    />
                    <Field
                        name="confirmPassword"
                        type="password"
                        component={CustomInput}
                        label="Confirm Password"
                        placeholder="Confirm your password"
                    />

                    {/* Submit Button */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <Button
                            type="submit"
                            className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0 shadow-lg hover:shadow-xl"
                            disabled={isSubmitting || registerLoading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {(isSubmitting || registerLoading) ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowIcon />
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default RegisterForm;