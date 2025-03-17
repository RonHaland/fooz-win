type IconProps = {
  className?: string;
};

export function SoccerballIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="1.5"></circle>
      <path
        d="M8 7.5L12 5L16 7.5L16 12.5L12 15L8 12.5L8 7.5Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      ></path>
      <path
        d="M 12.014 14.837 L 12.072 21.976 M 8.208 12.442 L 3.026 15.897 M 15.907 12.414 L 21.26 15.496"
        strokeWidth="1.5"
        strokeLinejoin="round"
      ></path>
      <path
        d="M 8.444 7.959 L 4.716 5.104 M 15.757 7.787 L 19.313 5.018"
        strokeWidth="1.5"
        strokeLinejoin="round"
      ></path>
      <line
        style={{ fill: "rgb(216, 216, 216)", stroke: "rgb(255, 255, 255)" }}
        x1="11.914"
        y1="5.126"
        x2="11.971"
        y2="2.119"
      ></line>
    </svg>
  );
}
