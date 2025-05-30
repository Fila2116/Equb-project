import React from 'react';
import { MdClose } from 'react-icons/md';

interface Props {
  title: string;
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Popup: React.FC<Props> = ({ title, children, open, setOpen }) => {
  return (
    <div className={`${open ? 'block' : 'hidden'} fixed inset-0 z-50 overflow-auto bg-gray-600 bg-opacity-50 flex justify-center items-center`}>
      <div className="relative flex flex-col items-center shadow-lg p-6 bg-white rounded-lg max-w-2xl w-full mx-4 sm:mx-0 max-h-vh-60 overflow-y-auto pb-4">
        <div className="flex items-center justify-between w-full border-b-2 pb-4 mb-6">
          <h6 className="text-xl font-semibold text-gray-900">
            {title}
          </h6>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
          >
            <MdClose size={24} />
          </button>
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Popup;