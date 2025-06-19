import React, { useMemo, useCallback } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUserAction } from "@/redux/actions/Login/loginUserAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

// Memoized icons to prevent recreation
const INPUT_ICONS = {
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
    )
};

const CustomInput = React.memo(({ field, form: { touched, errors }, label, ...props }) => {
    // Memoize computed values
    const hasError = touched[field.name] && errors[field.name];
    const hasValue = field.value;
    const isValid = touched[field.name] && !errors[field.name] && hasValue;

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

    return (
        <div className="relative group">
            <label htmlFor={field.name} className="block text-sm font-medium mb-2 text-white/90 group-focus-within:text-white transition-colors duration-200">
                {label}
            </label>
            <div className="relative">
                <Input
                    {...field}
                    {...props}
                    className={inputClassName}
                    style={{ boxShadow, paddingLeft: '2.5rem' }}
                />

                {/* Input Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors duration-200">
                    {INPUT_ICONS[props.type] || INPUT_ICONS.email}
                </div>

                {/* Status Icons */}
                {hasError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                        {INPUT_ICONS.error}
                    </div>
                )}

                {isValid && (
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
    type: PropTypes.string, // Add this line for 'type' prop validation
};

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
});

// Memoized social login icons
const SOCIAL_ICONS = {
    google: (
        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
    twitter: (
        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
    )
};

// Memoized social button component
const SocialButton = React.memo(({ icon, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
    >
        {icon}
    </button>
));

SocialButton.propTypes = {
    icon: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
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

const LoginForm = () => {
    const dispatch = useDispatch();
    const loginData = useSelector((state) => state.loginUser);
    const loginLoading = loginData?.loading;

    const handleSubmit = useCallback(async (values, { setSubmitting }) => {
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
    }, [dispatch]);

    const handleSocialLogin = useCallback((provider) => {
        console.log(`Login with ${provider}`);
        // Implement social login logic here
    }, []);

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
                <Form className="space-y-6">
                    <Field
                        name="email"
                        type="email"
                        component={CustomInput}
                        label="Email Address"
                        placeholder="Enter your email"
                    // style={{ paddingLeft: '2.5rem' }}
                    />
                    <Field
                        name="password"
                        type="password"
                        component={CustomInput}
                        label="Password"
                        placeholder="Enter your password"
                    // style={{ paddingLeft: '2.5rem' }}
                    />

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="text-sm text-white/60 hover:text-purple-300 transition-colors duration-200"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <Button
                            type="submit"
                            className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0 shadow-lg hover:shadow-xl"
                            disabled={isSubmitting || loginLoading}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {(isSubmitting || loginLoading) ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowIcon />
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>

                    {/* Social Login Divider */}
                    <div className="relative my-6">
                        <div className="flex items-center justify-center flex-auto">
                            <div className="w-[70%] border-t border-white/10" />
                            <div className="relative flex justify-center text-sm w-full">
                                <span className="px-4 bg-transparent text-white/50">Or continue with</span>
                            </div>
                            <div className="w-[70%] border-t border-white/10" />
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <SocialButton
                            icon={SOCIAL_ICONS.google}
                            onClick={() => handleSocialLogin('google')}
                        />
                        <SocialButton
                            icon={SOCIAL_ICONS.twitter}
                            onClick={() => handleSocialLogin('twitter')}
                        />
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default LoginForm;