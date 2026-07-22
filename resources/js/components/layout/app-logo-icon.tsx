import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <rect
                width="40"
                height="40"
                rx="8"
                fill="currentColor"
                className="fill-brand-blue text-brand-blue"
            />
            <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontFamily="Instrument Sans, system-ui, sans-serif"
                fontWeight="700"
                fontSize="18"
            >
                ES
            </text>
        </svg>
    );
}
