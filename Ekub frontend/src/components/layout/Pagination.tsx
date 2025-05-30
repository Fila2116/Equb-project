import { FC, ChangeEvent } from 'react';
import {BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { IconType } from 'react-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPage: number;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, onItemsPerPageChange, itemsPerPage }) => {

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }

    return (
      <ul className="flex">
        {pageNumbers.map((number, index) => (
          <li
            key={index}
            className={`mx-1 px-3 py-1 rounded cursor-pointer text-center ${currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              } ${number === '...' ? 'pointer-events-none' : ''}`}
            onClick={() => number !== '...' && onPageChange(Number(number))}
            style={{ minWidth: '2rem' }}
          >
            {number}
          </li>
        ))}
      </ul>
    );
  };

  const renderIcon = (icon: IconType, onClick: () => void, disabled: boolean) => {
    const IconComponent = icon;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`mx-1 px-3 py-1 rounded text-center ${disabled ? 'cursor-not-allowed bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-600'
          }`}
        style={{ minWidth: '2rem' }}
      >
        <IconComponent size={20} />
      </button>
    );
  };

  const handleItemsPerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onItemsPerPageChange(Number(event.target.value));
  };

  return (
    <div className="m-4 flex justify-between items-center">
      {(totalPages > 0 && <div className='flex items-center'>
        <label htmlFor="itemsPerPage" className="mr-2 text-secondary">Items per page</label>
        <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className="border border-gray-300 rounded px-2 py-1">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      )}
      {totalPages > 0 && (
        <div className="flex items-center">
          {renderIcon(BsChevronLeft, () => onPageChange(currentPage - 1), currentPage === 1)}
          {renderPageNumbers()}
          {renderIcon(BsChevronRight, () => onPageChange(currentPage + 1), currentPage === totalPages)}
        </div>
      )}
    </div>
  );
};

export default Pagination;
