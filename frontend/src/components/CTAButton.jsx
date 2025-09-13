// src/components/CTAButton.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

/**
 * CTAButton (arrowless)
 * - variant: "dark"  -> .btn .btn-primary
 *            "light" -> .btn .btn-secondary-dark
 * - size: "sm" | "md" | "lg"
 * - to: route path for Link/NavLink (e.g., "/get-started")
 * - useNavLink: true to use NavLink instead of Link
 * - fullWidth: make the button take full width (e.g., mobile menu)
 */
const CTAButton = ({
  label = "Get Started",
  to,
  onClick,
  variant = "dark",
  size = "md",
  useNavLink = false,
  fullWidth = false,
  className = "",
  style,
  ...rest
}) => {
  const variantClass =
    variant === "light" ? "btn-secondary-dark" : "btn-primary";

  const sizeClass =
    size === "sm"
      ? "text-sm px-4 py-2"
      : size === "lg"
      ? "text-lg px-8 py-4"
      : "text-base px-5 py-3"; // md default

  const baseClasses = `btn ${variantClass} ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`;

  const Content = () => (
    <span className="inline-flex items-center justify-center whitespace-nowrap">
      {label}
    </span>
  );

  if (to) {
    const LinkComp = useNavLink ? NavLink : Link;
    return (
      <LinkComp to={to} className={baseClasses} style={style} {...rest}>
        <Content />
      </LinkComp>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} style={style} {...rest}>
      <Content />
    </button>
  );
};

export default CTAButton;
