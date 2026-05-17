
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDateTimePickerProps {
  value: string; // ISO string
  onChange: (val: string) => void;
  showTime?: boolean;
  label?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({ value, onChange, showTime = true, label }) => {
  const selectedDate = useMemo(() => (value ? new Date(value) : new Date()), [value]);
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleMonthChange = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(viewDate.getFullYear());
    newDate.setMonth(viewDate.getMonth());
    newDate.setDate(day);
    onChange(newDate.toISOString());
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    onChange(newDate.toISOString());
  };

  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        options.push({ h, m });
      }
    }
    return options;
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      <div className="flex flex-col lg:flex-row bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        {/* Calendar Section */}
        <div className="p-6 flex-1 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h4>
            <div className="flex space-x-1">
              <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[9px] font-black text-slate-300 text-center uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate.getDate() === day && 
                               selectedDate.getMonth() === viewDate.getMonth() && 
                               selectedDate.getFullYear() === viewDate.getFullYear();
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection Bar */}
        {showTime && (
          <div className="lg:w-32 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center flex items-center justify-center">
              <Clock size={12} className="mr-1.5" /> Time
            </div>
            <div className="flex-1 overflow-y-auto max-h-[250px] lg:max-h-[300px] p-2 space-y-1 custom-scrollbar">
              {timeOptions.map(({ h, m }) => {
                const isSelected = selectedDate.getHours() === h && selectedDate.getMinutes() === m;
                const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                return (
                  <button
                    key={timeStr}
                    onClick={() => handleTimeSelect(h, m)}
                    className={`w-full py-2 px-3 rounded-xl text-[10px] font-black transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                    }`}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDateTimePicker;
