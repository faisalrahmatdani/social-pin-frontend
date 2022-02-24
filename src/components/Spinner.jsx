import React from "react";
import { Circles as Loader } from "react-loader-spinner";

function Spinner({ message }) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <Loader type="Circles" color="#6366f1" height={50} width={200} className="m-5" />

      <p className="text-lg text-center py-2">{message}</p>
    </div>
  );
}

export default Spinner;
