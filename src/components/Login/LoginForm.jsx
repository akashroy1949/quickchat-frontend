import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUserAction } from "@/redux/actions/Login/loginUserAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
    const dispatch = useDispatch();
    const loginData = useSelector((state) => state.loginUser);
    const loginLoading = loginData?.loading;
    console.log("Login Data:", loginData);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Email is required"),
            password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
        }),
        onSubmit: (values) => {
            dispatch(
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
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                    Email
                </label>
                <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.email && formik.errors.email ? "true" : undefined}
                />
                {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                    Password
                </label>
                <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.password && formik.errors.password ? "true" : undefined}
                />
                {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={formik.isSubmitting && loginLoading}
            >
                {(formik.isSubmitting && loginLoading) ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
};

export default LoginForm;
