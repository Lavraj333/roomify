import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
	fullwidth?: boolean;
};

export default function Button({
	variant = "primary",
	size = "md",
	fullwidth = false,
	className = "",
	children,
	...props
}: ButtonProps) {
	const classes = [
		"btn",
		`btn--${variant}`,
		`btn--${size}`,
		fullwidth && "btn--full",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button {...props} className={classes}>
			{children}
		</button>
	);
}
