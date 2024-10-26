import React from 'react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

    const maxPage = totalPages < 6 ? totalPages : 6;
    const isBackDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    const pages = Array.from({ length: maxPage }, (_, i) => {
        if (totalPages < maxPage) {
            return i + 1;
        }
        if (currentPage < maxPage / 2) {
            return i + 1;
        }
        if (currentPage > totalPages - maxPage / 2) {
            return totalPages - maxPage + i + 1;
        }
        return currentPage - maxPage / 2 + i + 1
    });

    return (
        <div className="pagination-container">
            <button
                onClick={() => {
                    if (!isBackDisabled) onPageChange(currentPage - 1);
                }}
                disabled={isBackDisabled}
            >
                Trang trước
            </button>
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={currentPage === page}
                    className={currentPage === page ? 'active' : ''}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => {
                    if (!isNextDisabled) onPageChange(currentPage + 1);
                }}
                disabled={isNextDisabled}
            >
                Trang sau
            </button>
        </div>
    );
}

export default Pagination;
