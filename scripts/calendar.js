(function () {
// ===============================
// НАСТРОЙКИ КАЛЕНДАРЯ
// ===============================

// Пример данных: ключ - дата, значение - booked: true/false
// В реальном проекте можно подгружать этот JSON с сервера.
const bookingData = {
    "2025-01-05": { booked: true },
    "2025-01-06": { booked: true },
    "2025-01-12": { booked: true },
  
    "2025-02-10": { booked: true },
    "2025-02-11": { booked: true },
  
    "2025-06-01": { booked: true },
    "2025-06-02": { booked: true },
    "2025-06-03": { booked: true }
  
    // и так далее...
  };



// Для какого года генерируем 12 месяцев
let currentYear = new Date().getFullYear();

// Текущий отображаемый месяц (0-11)
let currentMonthIndex = new Date().getMonth();

// Локализованные названия месяцев (для заголовка)
const monthNamesRu = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

// Выбор элементов DOM
const calendarEl = document.querySelector(".calendar");
if (!calendarEl) return;
const monthTitleEl = calendarEl.querySelector(".month");
const daysContainerEl = calendarEl.querySelector(".days");
const prevBtn = calendarEl.querySelector(".prev-btn");
const nextBtn = calendarEl.querySelector(".next-btn");
const todayBtn = calendarEl.querySelector(".today-btn");

// ===============================
// ХЕЛПЕРЫ
// ===============================

// Получить строку даты в формате YYYY-MM-DD
function formatDate(year, monthIndex, day) {
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// Проверить, забронирован ли день
function isBooked(dateStr) {
  const info = bookingData[dateStr];
  return info && info.booked === true;
}

// ===============================
// РЕНДЕР КАЛЕНДАРЯ
// ===============================

function renderCalendar(year, monthIndex) {
  // Заголовок: "Месяц Год"
  monthTitleEl.textContent = `${monthNamesRu[monthIndex]} ${year}`;

  // Очищаем контейнер с днями
  daysContainerEl.innerHTML = "";

  // Дата первого дня месяца
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = firstDayOfMonth.getDay(); // 0 - воскресенье, 1 - понедельник, ...

  // Кол-во дней в месяце
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Нам нужно сдвинуть начало, чтобы дни начинались в правильный день недели
  // В твоей шапке недели порядок: Вс, Пн, Вт, Ср, Чт, Пт, Сб
  // getDay() как раз возвращает 0 для Вс, так что можно использовать напрямую.

  // Рисуем пустые слоты перед началом месяца (если нужно)
for (let i = 0; i < firstWeekday; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day", "empty");
    daysContainerEl.appendChild(emptyCell);
  }
  
  // Рисуем реальные дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day");
  
    const dateStr = formatDate(year, monthIndex, day);
    const booked = isBooked(dateStr);
  
    if (booked) {
      cell.classList.add("booked");
      cell.setAttribute("data-status", "booked");
      cell.setAttribute("title", `Занято: ${dateStr}`);
    } else {
      cell.classList.add("free");
      cell.setAttribute("data-status", "free");
      cell.setAttribute("title", `Свободно: ${dateStr}`);
    }

    const today = new Date();
    if (day === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today");
      cell.setAttribute("aria-current", "date");
    }
  
    cell.textContent = day;
    cell.dataset.date = dateStr;
  
    daysContainerEl.appendChild(cell);
  }
  
}

// ===============================
// ПЕРЕКЛЮЧЕНИЕ МЕСЯЦЕВ
// ===============================

function showPrevMonth() {
  currentMonthIndex--;
  if (currentMonthIndex < 0) {
    currentMonthIndex = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonthIndex);
}

function showNextMonth() {
  currentMonthIndex++;
  if (currentMonthIndex > 11) {
    currentMonthIndex = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonthIndex);
}

function showCurrentMonth() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonthIndex = today.getMonth();
  renderCalendar(currentYear, currentMonthIndex);
}

// ===============================
// ОБРАБОТЧИКИ КНОПОК
// ===============================

if (prevBtn) prevBtn.addEventListener("click", showPrevMonth);
if (nextBtn) nextBtn.addEventListener("click", showNextMonth);
if (todayBtn) todayBtn.addEventListener("click", showCurrentMonth);

// ===============================
// ПЕРВИЧНЫЙ РЕНДЕР: 12 МЕСЯЦЕВ В ГОДУ
// ===============================
// По факту мы в интерфейсе показываем по одному месяцу,
// но логика рассчитана на любые 12 месяцев конкретного года.
// Начинаем с текущего месяца:
renderCalendar(currentYear, currentMonthIndex);
})();
