type ChevronIconProps = {
  onClick: () => void;
};

function ChevronIcon({ onClick }: ChevronIconProps) {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path
        d="M1 1 L12 11 L23 1"
        stroke={isDark ? "white" : "black"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ChevronIcon;
