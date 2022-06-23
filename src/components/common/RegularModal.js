import React, { useState } from "react";
import OcxButton from "./OcxButton";

const RegularModal = (props) => {
  const { show = false, title, children } = props;

  const [showModal, setShowModal] = useState(show);
  //   const [showModal, setShowModal] = useState(false);
  //   const [title,setTitle] = useState()

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex  items-end lg:items-center justify-center min-h-full p-14 text-center lg:p-0">
          <div className="relative w-1/2  bg-white rounded-lg text-left overflow-hidden ">
            <div className="font-28 bg-white text-black px-4 pt-5 pb-4 lg:p-6 lg:pb-4">
              {children}
            </div>
            <div className="grid justify-items-center bg-gray-50 px-4 py-3 ">
              <OcxButton label="OK"></OcxButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularModal;
