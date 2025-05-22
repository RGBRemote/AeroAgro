document.addEventListener('DOMContentLoaded', function() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarMonth = document.querySelector('.calendar-month');
    const calendarDays = document.getElementById('calendar-days');
    
    let currentDate = new Date();
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        calendarMonth.textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        calendarDays.innerHTML = '';
        
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('prev-month');
            dayElement.textContent = daysInPrevMonth - i;
            calendarDays.appendChild(dayElement);
        }
        
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('current-day');
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        const totalCells = firstDay + daysInMonth;
        const nextMonthDays = 7 - (totalCells % 7);
        if (nextMonthDays < 7) {
            for (let i = 1; i <= nextMonthDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('next-month');
                dayElement.textContent = i;
                calendarDays.appendChild(dayElement);
            }
        }
    }
    
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    renderCalendar();
    
    
    

    calendarDays.addEventListener('mouseover', function(e) {
        if (e.target.tagName === 'DIV' && !e.target.classList.contains('calendar-weekdays')) {
            e.target.style.backgroundColor = '#F1F8E9';
            e.target.style.color = '#4CAF50';
        }
    });
    
    calendarDays.addEventListener('mouseout', function(e) {
        if (e.target.tagName === 'DIV' && !e.target.classList.contains('current-day') 
            && !e.target.classList.contains('calendar-weekdays')) {
            e.target.style.backgroundColor = '';
            e.target.style.color = '';
        }
    });
});