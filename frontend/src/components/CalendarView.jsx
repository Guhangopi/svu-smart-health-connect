import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarView.css'; // We will create this for custom styles

const CalendarView = ({ unavailableDates, onDateClick }) => {
  // unavailableDates is a list of strings: ["2024-12-25", ...]

  // Helper to format date as YYYY-MM-DD using local time
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDateLocal(date);
      if (unavailableDates.includes(dateStr)) {
        return 'unavailable-date';
      }
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <Calendar
        minDate={new Date()}
        onClickDay={(date) => {
            const dateStr = formatDateLocal(date);
            onDateClick(dateStr);
        }}
        tileClassName={tileClassName}
        showNeighboringMonth={false}
      />
    </div>
  );
};

export default CalendarView;
