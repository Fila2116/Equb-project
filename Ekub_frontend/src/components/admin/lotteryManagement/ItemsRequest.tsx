// import React from 'react'

interface ItemsRequestProps {
  amount: number;
  description: string;
  item: string;
}

const ItemsRequest: React.FC<ItemsRequestProps> = ({
  amount,
  description,
  item,
}) => {
  return (
    <div className="bg-white p-6 shadow-md rounded-lg space-y-4">
      {/* <h2 className='mb-6 text-lg font-semibold text-gray-700'>Request Information</h2> */}
      <div className="flex justify-between items-center border-b pb-2">
        <p className="text-gray-600 font-medium">Item</p>
        <p className="text-gray-800">{item}</p>
      </div>
      <div className="flex justify-between items-center border-b pb-2">
        <p className="text-gray-600 font-medium">Description</p>
        <p className="text-gray-800">{description}</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-medium">Expected Amount</p>
        <p className="text-gray-800">{amount}</p>
      </div>
    </div>
  );
};

export default ItemsRequest;
