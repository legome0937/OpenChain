import { useState } from "react";

const OcxCheckBox = (props) => {
  const { id, label, onCheckChanged = null } = props;

  const onChange = (ev) => {
    let val = ev.target.checked;
    if (onCheckChanged) {
      onCheckChanged(val);
    }
  };

  return (
    <div className="flex items-center">
      <input
        defaultChecked={id == 0 ? true : false}
        id={id}
        type="radio"
        value={id}
        name="colored-radio"
        onChange={onChange}
        className="w-8 h-8 form-radio text-green-500 focus:outline-none bg-gray-100 "
      />
      <label
        htmlFor={id}
        className="ml-5 font-18 main-font main-color dark:text-lightgray-color"
      >
        {label}
      </label>
    </div>
  );
};

export default OcxCheckBox;
