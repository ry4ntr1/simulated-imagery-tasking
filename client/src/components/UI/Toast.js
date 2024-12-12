import React from "react";

const Toast = ({ message }) => {
	return (
		<div className="fixed bottom-4 right-4 bg-[#412db5] text-white py-2 px-4 rounded-lg shadow-lg z-50">
			{message}
		</div>
	);
};

export default Toast;
