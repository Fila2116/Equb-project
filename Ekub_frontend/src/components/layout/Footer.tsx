import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className='bg-white h-16 w-full flex items-center justify-center'>
      <p className=' leading-3 text-gray-500 text-xs'>
        &copy; {new Date().getFullYear()} Ashewa Technologies. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;