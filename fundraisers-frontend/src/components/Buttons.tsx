import { type ReactNode } from "react";

interface BtnProps {
    className? : string;
    type: 'button' | 'submit' | 'reset' | undefined;
    children: ReactNode;
    onClick: () => void;
}

export default function Buttons(props: BtnProps) {
    const {className, type="button",onClick, children} = props
    return (
        <button type={type} className={`backdrop-blur-sm shadow-md hover:shadow-cyan-500/50 transition-shadow duration-300 text-black ${className} cursor-pointer`} onClick={onClick}>
            {children}
        </button>
    );

}