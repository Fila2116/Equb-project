import React from "react";
import { imageUrl } from "../../../utils/imageUrl";

// Define the prop types
interface ImagePayProps {
  photo: string;
}

const ImagePay: React.FC<ImagePayProps> = ({ photo }) => {
  // const imageUrl = process.env.REACT_APP_BASE_URL
  return (
    <div className="flex justify-center items-center py-6">
      {photo ? (
        <div>
          <img
            src={imageUrl("payment", photo)}
            alt={`Payment ${photo}`} // Providing a meaningful alt text
            className="w-80 h-80 object-cover" // Adjust this class as needed
            loading="lazy"
          />
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No payment available with the specified ID.
        </p>
      )}
    </div>
  );
};

export default ImagePay;
