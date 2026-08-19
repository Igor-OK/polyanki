(function () {
  "use strict";

  /*
   * URL будущего API.
   *
   * После публикации Google Apps Script достаточно задать адрес до подключения
   * calendar.js:
   * window.POLYANKI_CALENDAR_API_URL = "https://script.google.com/macros/s/.../exec";
   *
   * Пока адрес пустой, календарь использует демонстрационные интервалы ниже.
   */
  const API_URL = window.POLYANKI_CALENDAR_API_URL || "";
  const TIMEZONE = "Europe/Minsk";
  const CHECK_OUT_TIME = "12:00";
  const CHECK_IN_TIME = "15:00";

  const calendarEl = document.querySelector(".calendar");
  if (!calendarEl) return;

  const monthTitleEl = calendarEl.querySelector(".month");
  const daysContainerEl = calendarEl.querySelector(".days");
  const detailsEl = calendarEl.querySelector(".calendar-day-details");
  const prevBtn = calendarEl.querySelector(".prev-btn");
  const nextBtn = calendarEl.querySelector(".next-btn");
  const todayBtn = calendarEl.querySelector(".today-btn");

  const monthNamesRu = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const dayStateNames = {
    free: "Свободно",
    checkin: "Частично свободно — заезд",
    checkout: "Частично свободно — выезд",
    turnover: "Смена гостей",
    occupied: "Занято"
  };

  /*
   * Близкие оттенки бордового помогают визуально отделить соседние заезды.
   * Цвет выбирается по ID: все дни одного бронирования всегда получают
   * одинаковый оттенок, даже после обновления страницы.
   */
  const bookingColors = ["#7f3035", "#b6534b", "#933f5a", "#c66e5e"];

  let currentYear = new Date().getFullYear();
  let currentMonthIndex = new Date().getMonth();
  let calendarEvents = [];
  let selectedDate = null;

  /*
   * Демонстрационные события повторяют структуру ответа будущего API.
   * Они нужны только для разработки и автоматически создаются рядом с текущей датой.
   * Персональные данные гостей в публичный API передавать не следует.
   */
  function createDemoEvents() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    return [
      {
        id: "demo-booking-1",
        type: "booking",
        status: "confirmed",
        start: toLocalIso(year, month, 5, CHECK_IN_TIME),
        end: toLocalIso(year, month, 9, CHECK_OUT_TIME)
      },
      {
        id: "demo-booking-2",
        type: "booking",
        status: "confirmed",
        start: toLocalIso(year, month, 9, CHECK_IN_TIME),
        end: toLocalIso(year, month, 12, CHECK_OUT_TIME)
      },
      {
        id: "demo-pending",
        type: "booking",
        status: "pending",
        start: toLocalIso(year, month, 18, CHECK_IN_TIME),
        end: toLocalIso(year, month, 21, CHECK_OUT_TIME)
      },
      {
        id: "demo-maintenance",
        type: "blocked",
        status: "confirmed",
        start: toLocalIso(year, month, 25, "09:00"),
        end: toLocalIso(year, month, 26, "18:00")
      }
    ];
  }

  /*
   * Формирует ISO-строку с минским смещением.
   * Для реального API смещение уже должно приходить в полях start и end.
   */
  function toLocalIso(year, monthIndex, day, time) {
    const month = String(monthIndex + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    return `${year}-${month}-${date}T${time}:00+03:00`;
  }

  /*
   * Загружает интервалы бронирований.
   * Ожидаемый ответ API:
   * {
   *   "timezone": "Europe/Minsk",
   *   "updatedAt": "2026-08-03T14:30:00Z",
   *   "events": [{ "id", "type", "status", "start", "end" }]
   * }
   */
  async function loadCalendarEvents() {
    setLoading(true);

    if (!API_URL) {
      calendarEvents = normalizeEvents(createDemoEvents());
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`API календаря вернул код ${response.status}`);
      }

      const payload = await response.json();
      if (!payload || !Array.isArray(payload.events)) {
        throw new Error("В ответе API отсутствует массив events");
      }

      calendarEvents = normalizeEvents(payload.events);
      calendarEl.dataset.updatedAt = payload.updatedAt || "";
      calendarEl.dataset.timezone = payload.timezone || TIMEZONE;
      saveEventsToCache(payload);
    } catch {
      const cachedEvents = readEventsFromCache();
      calendarEvents = cachedEvents.length ? cachedEvents : normalizeEvents(createDemoEvents());
      showSystemMessage(
        cachedEvents.length
          ? "Не удалось обновить данные. Показана последняя сохранённая версия."
          : "API пока недоступен. Показаны демонстрационные данные."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Проверяет входящие события и заранее преобразует даты.
   * Некорректные или отменённые записи не участвуют в расчёте.
   */
  function normalizeEvents(events) {
    return events
      .filter(event => event && event.status !== "cancelled")
      .map(event => ({
        id: String(event.id || ""),
        type: event.type === "blocked" ? "blocked" : "booking",
        status: event.status === "pending" ? "pending" : "confirmed",
        start: new Date(event.start),
        end: new Date(event.end)
      }))
      .filter(event => (
        !Number.isNaN(event.start.getTime()) &&
        !Number.isNaN(event.end.getTime()) &&
        event.end > event.start
      ))
      .sort((first, second) => first.start - second.start)
      .map((event, index) => ({
        ...event,
        /* Соседние по времени бронирования гарантированно получают разные оттенки. */
        color: bookingColors[index % bookingColors.length]
      }));
  }

  /*
   * Рассчитывает состояние одной даты из интервалов.
   * В базе не нужно хранить отдельные статусы каждого дня:
   * они пересчитываются автоматически после переноса бронирования.
   */
  function calculateDayState(year, monthIndex, day) {
    const dayStart = new Date(year, monthIndex, day, 0, 0, 0);
    const dayEnd = new Date(year, monthIndex, day + 1, 0, 0, 0);

    const overlapping = calendarEvents.filter(event => (
      event.start < dayEnd && event.end > dayStart
    ));

    /*
     * Для посетителя важна только доступность. Поэтому технические блокировки
     * и предварительные брони показываются как занятый период.
     */
    const unavailableEvents = overlapping.filter(event => (
      event.type === "blocked" || event.status === "pending"
    ));
    const bookings = overlapping.filter(event => (
      event.type === "booking" && event.status === "confirmed"
    ));

    const checkins = bookings.filter(event => isSameLocalDay(event.start, dayStart));
    const checkouts = bookings.filter(event => isSameLocalDay(event.end, dayStart));
    const staysThroughDay = bookings.some(event => (
      event.start < dayStart && event.end >= dayEnd
    ));

    let state = "free";
    if (unavailableEvents.length) state = "occupied";
    else if (checkins.length && checkouts.length) state = "turnover";
    else if (checkins.length) state = "checkin";
    else if (checkouts.length) state = "checkout";
    else if (staysThroughDay || bookings.length) state = "occupied";

    return {
      date: formatDate(year, monthIndex, day),
      state,
      checkIn: checkins[0] ? formatTime(checkins[0].start) : null,
      checkOut: checkouts[0] ? formatTime(checkouts[0].end) : null,
      nightAvailable: !bookings.some(event => event.end > new Date(year, monthIndex, day, 18, 0, 0)),
      events: overlapping,
      /* Левая часть относится к гостям, которые уже проживают или выезжают. */
      colorBefore: getBookingColor(
        checkouts[0]?.id || bookings.find(event => event.start < dayStart)?.id || unavailableEvents[0]?.id
      ),
      /* Правая часть относится к гостям, которые заезжают или продолжают проживание. */
      colorAfter: getBookingColor(
        checkins[0]?.id || bookings.find(event => event.end > dayEnd)?.id || bookings[0]?.id || unavailableEvents[0]?.id
      )
    };
  }

  function getBookingColor(bookingId) {
    if (!bookingId) return bookingColors[0];

    const event = calendarEvents.find(item => item.id === String(bookingId));
    if (event?.color) return event.color;

    let hash = 0;
    for (const character of String(bookingId)) {
      hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    }

    return bookingColors[Math.abs(hash) % bookingColors.length];
  }

  function renderCalendar() {
    monthTitleEl.textContent = `${monthNamesRu[currentMonthIndex]} ${currentYear}`;
    daysContainerEl.innerHTML = "";

    const firstWeekday = new Date(currentYear, currentMonthIndex, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const emptyCell = document.createElement("span");
      emptyCell.className = "day empty";
      emptyCell.setAttribute("aria-hidden", "true");
      daysContainerEl.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = calculateDayState(currentYear, currentMonthIndex, day);
      const cell = document.createElement("button");

      cell.type = "button";
      cell.className = `day calendar-day state-${dayData.state}`;
      cell.textContent = String(day);
      cell.dataset.date = dayData.date;
      cell.dataset.state = dayData.state;
      /* CSS использует эти цвета для цельной цепочки одного бронирования. */
      cell.style.setProperty("--booking-before", dayData.colorBefore);
      cell.style.setProperty("--booking-after", dayData.colorAfter);
      cell.setAttribute("aria-label", createDayAriaLabel(dayData));
      cell.setAttribute("title", createDayDescription(dayData));

      if (isToday(currentYear, currentMonthIndex, day)) {
        cell.classList.add("today");
        cell.setAttribute("aria-current", "date");
      }

      if (selectedDate === dayData.date) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => {
        selectedDate = dayData.date;
        showDayDetails(dayData);
        renderCalendar();
      });

      daysContainerEl.appendChild(cell);
    }
  }

  function createDayDescription(dayData) {
    return dayStateNames[dayData.state];
  }

  function createDayAriaLabel(dayData) {
    return `${formatDateForHuman(dayData.date)}. ${createDayDescription(dayData)}`;
  }

  function showDayDetails(dayData) {
    if (!detailsEl) return;
    detailsEl.innerHTML = `
      <strong>${formatDateForHuman(dayData.date)}</strong>
      <span>${createDayDescription(dayData)}</span>
    `;
  }

  function showSystemMessage(message) {
    if (!detailsEl) return;
    detailsEl.innerHTML = `<strong>Обновление календаря</strong><span>${message}</span>`;
  }

  function setLoading(isLoading) {
    calendarEl.classList.toggle("is-loading", isLoading);
    calendarEl.setAttribute("aria-busy", String(isLoading));
  }

  /*
   * Кэш нужен только как резерв на случай временной недоступности API.
   * Он не используется как источник для редактирования данных.
   */
  function saveEventsToCache(payload) {
    try {
      localStorage.setItem("polyanki-calendar-cache", JSON.stringify(payload));
    } catch {}
  }

  function readEventsFromCache() {
    try {
      const raw = localStorage.getItem("polyanki-calendar-cache");
      if (!raw) return [];
      const payload = JSON.parse(raw);
      return Array.isArray(payload.events) ? normalizeEvents(payload.events) : [];
    } catch {
      return [];
    }
  }

  function formatDate(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function formatDateForHuman(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(year, month - 1, day));
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TIMEZONE
    }).format(date);
  }

  function isSameLocalDay(firstDate, secondDate) {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  function isToday(year, monthIndex, day) {
    const today = new Date();
    return (
      day === today.getDate() &&
      monthIndex === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function showPrevMonth() {
    currentMonthIndex--;
    if (currentMonthIndex < 0) {
      currentMonthIndex = 11;
      currentYear--;
    }
    selectedDate = null;
    renderCalendar();
  }

  function showNextMonth() {
    currentMonthIndex++;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }
    selectedDate = null;
    renderCalendar();
  }

  function showCurrentMonth() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonthIndex = today.getMonth();
    selectedDate = formatDate(currentYear, currentMonthIndex, today.getDate());
    renderCalendar();
    showDayDetails(calculateDayState(currentYear, currentMonthIndex, today.getDate()));
  }

  prevBtn?.addEventListener("click", showPrevMonth);
  nextBtn?.addEventListener("click", showNextMonth);
  todayBtn?.addEventListener("click", showCurrentMonth);

  loadCalendarEvents().then(renderCalendar);
})();
