import { SVGProps } from "react";

export function FootballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      strokeWidth={25}
      className={props.className}
    >
      <style>
        {`
        .a{fill:none;stroke:currentColor;stroke-miterlimit:100;}
        .b{stroke:currentColor;stroke-miterlimit:100;fill:none}
        `}
      </style>
      <path
        className="a"
        d="m200 385c-102.3 0-185-82.7-185-185 0-102.3 82.7-185 185-185 102.3 0 185 82.7 185 185 0 102.3-82.7 185-185 185z"
      />
      <path
        className="b"
        d="m278.7 256l-101.2 30.1-59.9-86.9 64.2-83.9 99.5 35.1z"
      />
      <path
        className="a"
        d="m176.6 108.2l-63 91.8-92.1-8.9 36.2-103.6 85.3-58z"
      />
      <path
        className="a"
        d="m177.8 290l101-30.6 70.2 39.1-74.8 61.9-112.2 15.7z"
      />
      <path
        className="a"
        d="m276.4 258.7l7.4-110.7c-0.1 0 75.9-33.3 76-33.3l19.1 81.9-27.8 98.3z"
      />
      <path
        className="a"
        d="m280.8 154.3l-104.8-37.9-14.5-91.3 109.4 8.9 77.5 68z"
      />
      <path
        className="a"
        d="m109.4 196.4l67.4 88.7-37.3 84.6-87.1-66.9-28.2-99.2z"
      />
    </svg>
  );
}
