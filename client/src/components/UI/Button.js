import React from "react";

const Button = ({ onClick, iconClass, ariaLabel }) => {
  return (
    <button
      className="text-[#412db5] border border-[#412db5] bg-white px-2 py-2 rounded shadow-lg"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <i className={iconClass}></i>
    </button>
  );
};

export default Button;
