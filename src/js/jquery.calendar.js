/**
 * jQuery.calendar.js
 *
 * Philipp König
 * https://blockbyte.de
 */
/**
 *
 * @param {jQuery} $
 */
($ => {
    "use strict";

    let Calendar = function (elm) {

        let defaults = {
            startDate: new Date(),
            minDate: null, // new Date(), today oder z.B. +1d, -1w, +3m, -2y
            maxDate: null, // new Date(), today oder z.B. +1d, -1w, +3m, -2y
            monthNames: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
            dayNames: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
            prevNextButtons: true,
            gotoTodayButton: true,
            classes: {
                calendar: "jc-calendar",
                header: "jc-header",
                prevMonth: "jc-prev",
                nextMonth: "jc-next",
                gotoToday: "jc-gotoToday",
                selectMonth: "jc-select-month",
                selectYear: "jc-select-year",
                dayLabels: "jc-dayLabels",
                dayWrapper: "jc-days",
                day: "jc-day",
                dayInactive: "jc-inactive",
                dayToday: "jc-today",
                dayEmpty: "jc-empty",
                hidden: "jc-hidden"
            },
            onInited: () => {
            },
            onDayMouseenter: () => {
            },
            onDayMouseleave: () => {
            },
            onDayClick: () => {
            },
            onMonthChange: () => {
            },
            onYearChange: () => {
            },
            onDateChange: () => {
            }
        };

        let currentDate = null;
        let now = new Date();
        let opts;

        /*
         * Init
         */
        let initBounds = () => {
            $.each(["minDate", "maxDate"], (i, field)=> { // Parsed die konfigurierten Werte fÃ¼r minDate und maxDate
                if (!(opts[field] instanceof Date)) {
                    let val = opts[field];

                    if (val === "today" || val.search(/^(\-|\+?)\d+[dwmy]$/) === 0) {
                        opts[field] = new Date();

                        if (val !== "today") {
                            val = val.replace(/^\+/, "");
                            let n = val.slice(0, -1);
                            let unit = val[val.length - 1];
                            switch (unit) {
                                case "d": {
                                    opts[field].setDate(opts[field].getDate() + parseInt(n));
                                    break;
                                }
                                case "w": {
                                    opts[field].setDate(opts[field].getDate() + (parseInt(n) * 7));
                                    break;
                                }
                                case "m": {
                                    opts[field].setMonth(opts[field].getMonth() + parseInt(n));
                                    break;
                                }
                                case "y": {
                                    opts[field].setFullYear(opts[field].getFullYear() + parseInt(n));
                                    break;
                                }
                            }
                        }
                    } else { // ungÃ¼ltige Konfiguration oder kein Wert gewÃ¼nscht -> ignorieren
                        opts[field] = null;
                    }
                }
            });

            if (opts.minDate.getTime() > opts.maxDate.getTime()) { // minDate kann nicht grÃ¶ÃŸer als maxDate sein
                opts.minDate = new Date(opts.maxDate.getTime());
            }

            correctCurrentDate();
            changeYearSelectValues();
            changeMonthSelectValues();
            changePrevNextButtonVisibility();
        };


        let correctCurrentDate = () => {
            if (opts.maxDate !== null && currentDate.getTime() > opts.maxDate.getTime()) { // currentDate kann nicht grÃ¶ÃŸer als maxDate sein
                currentDate = new Date(opts.maxDate.getTime());
            } else if (opts.minDate !== null && currentDate.getTime() < opts.minDate.getTime()) { // currentDate kann nicht kleiner als maxDate sein
                currentDate = new Date(opts.minDate.getTime());
            }
        };


        let changeMonthSelectValues = () => {
            let selectMonth = elm.find("header." + opts.classes.header + " > select." + opts.classes.selectMonth).empty();

            for (let i = 0; i < 12; i++) {
                let optionDateMin = new Date(currentDate.getFullYear(), i + 1, 0, 23, 59, 59);
                let optionDateMax = new Date(currentDate.getFullYear(), i, 1, 0, 0, 0);

                if ((opts.minDate === null || optionDateMin.getTime() > opts.minDate.getTime()) && (opts.maxDate === null || optionDateMax.getTime() < opts.maxDate.getTime())) {
                    let option = $("<option />").val(i).text(opts.monthNames[i]).appendTo(selectMonth);
                    if (i === currentDate.getMonth()) {
                        option.attr("selected", "selected");
                    }
                }
            }
        };


        let changeYearSelectValues = () => {
            let selectableYears = {
                min: currentDate.getFullYear() + 5,
                max: currentDate.getFullYear() - 10
            };

            if (opts.minDate !== null) {
                selectableYears.min = opts.minDate.getFullYear();
            }
            if (opts.maxDate !== null) {
                selectableYears.max = opts.maxDate.getFullYear();
            }

            let selectYear = elm.find("header." + opts.classes.header + " > select." + opts.classes.selectYear).empty();
            for (let i = selectableYears.max; i >= selectableYears.min; i--) {
                let option = $("<option />").val(i).text(i).appendTo(selectYear);
                if (i === currentDate.getFullYear()) {
                    option.attr("selected", "selected");
                }
            }
        };


        let changePrevNextButtonVisibility = () => {
            elm.find("header." + opts.classes.header + " > a." + opts.classes.nextMonth).removeClass(opts.classes.hidden);
            elm.find("header." + opts.classes.header + " > a." + opts.classes.prevMonth).removeClass(opts.classes.hidden);
            elm.find("header." + opts.classes.header + " > a." + opts.classes.gotoToday).removeClass(opts.classes.hidden);

            let prevMonthInfos = getDateInfos(currentDate.getFullYear(), currentDate.getMonth(), 0);
            if (!prevMonthInfos.inBounds) {
                elm.find("header." + opts.classes.header + " > a." + opts.classes.prevMonth).addClass(opts.classes.hidden);
            }

            let nextMonthInfos = getDateInfos(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            if (!nextMonthInfos.inBounds) {
                elm.find("header." + opts.classes.header + " > a." + opts.classes.nextMonth).addClass(opts.classes.hidden);
            }

            if (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth()) {
                elm.find("header." + opts.classes.header + " > a." + opts.classes.gotoToday).addClass(opts.classes.hidden);
            }
        };


        let changeCurrentDate = (obj) => {
            let oldYear = currentDate.getFullYear();
            let oldMonth = currentDate.getMonth();

            $.each(obj, (type, value) => {
                switch (type) {
                    case "year": {
                        currentDate.setFullYear(value);
                        break;
                    }
                    case "month": {
                        currentDate.setMonth(value);
                        break;
                    }
                    case "day": {
                        currentDate.setDate(value);
                        break;
                    }
                }
            });

            correctCurrentDate();
            changeYearSelectValues();
            changeMonthSelectValues();
            changePrevNextButtonVisibility();
            fillDays();

            if (oldMonth !== currentDate.getMonth()) {
                opts.onMonthChange({
                    calendar: this.getCalendar(),
                    daysOfCurrentMonth: this.getDaysOfCurrentMonth(),
                    date: this.getCurrentDate()
                });
            }

            if (oldYear !== currentDate.getFullYear()) {
                opts.onYearChange({
                    calendar: this.getCalendar(),
                    daysOfCurrentMonth: this.getDaysOfCurrentMonth(),
                    date: this.getCurrentDate()
                });
            }

            if (oldYear !== currentDate.getFullYear() || oldMonth !== currentDate.getMonth()) {
                opts.onDateChange({
                    calendar: this.getCalendar(),
                    daysOfCurrentMonth: this.getDaysOfCurrentMonth(),
                    date: this.getCurrentDate()
                });
            }
        };


        let initEvents = () => {
            elm.on("change", "header." + opts.classes.header + " > select." + opts.classes.selectYear, (e) => {
                changeCurrentDate({event: e, year: $(e.currentTarget).val()});
            });

            elm.on("change", "header." + opts.classes.header + " > select." + opts.classes.selectMonth, (e) => {
                changeCurrentDate({event: e, month: $(e.currentTarget).val()});
            });

            elm.on("click", "div." + opts.classes.dayWrapper + " > div > a", (e) => { // Klick auf bestimmten Tag
                e.preventDefault();
                opts.onDayClick({
                    event: e,
                    calendar: this.getCalendar(),
                    elm: $(e.currentTarget).parent("div"),
                    date: $(e.currentTarget).data("date")
                });
            }).on("mouseenter", "div." + opts.classes.dayWrapper + " > div > a", (e) => { // Mouseover Ã¼ber bestimmten Tag
                e.preventDefault();
                opts.onDayMouseenter({
                    event: e,
                    calendar: this.getCalendar(),
                    elm: $(e.currentTarget).parent("div"),
                    date: $(e.currentTarget).data("date")
                });
            }).on("mouseleave", "div." + opts.classes.dayWrapper + " > div > a", (e) => { // Mouseleave von bestimmten Tag
                e.preventDefault();
                opts.onDayMouseleave({
                    event: e,
                    calendar: this.getCalendar(),
                    elm: $(e.currentTarget).parent("div"),
                    date: $(e.currentTarget).data("date")
                });
            });

            elm.on("click", "header." + opts.classes.header + " > a." + opts.classes.nextMonth + ", header." + opts.classes.header + " > a." + opts.classes.prevMonth, (e) => {
                e.preventDefault();
                let x = $(e.currentTarget).hasClass(opts.classes.prevMonth) ? -1 : 1;
                changeCurrentDate({month: currentDate.getMonth() + x});
            });

            elm.on("click", "header." + opts.classes.header + " > a." + opts.classes.gotoToday, (e) => {
                e.preventDefault();
                changeCurrentDate({year: now.getFullYear(), month: now.getMonth()});
            });
        };


        let initHtml = () => {
            elm.empty();
            let calendar = $("<div />").addClass(opts.classes.calendar).appendTo(elm);

            let header = $("<header />").addClass(opts.classes.header).appendTo(calendar);

            if (opts.prevNextButtons) {
                $("<a />").attr("href", "#").addClass(opts.classes.prevMonth).appendTo(header);
                $("<a />").attr("href", "#").addClass(opts.classes.nextMonth).appendTo(header);
            }

            if (opts.gotoTodayButton) {
                let todayInfos = getDateInfos(now.getFullYear(), now.getMonth(), now.getDate());
                if (todayInfos.inBounds) { // nur anzeigen wenn das heutige Datum Ã¼berhaupt im Kalendar angezeigt wird
                    $("<a />").attr("href", "#").addClass(opts.classes.gotoToday).appendTo(header);
                }
            }

            $("<select />").addClass(opts.classes.selectMonth).appendTo(header);
            $("<select />").addClass(opts.classes.selectYear).appendTo(header);

            let dayLabels = $("<div />").addClass(opts.classes.dayLabels).appendTo(header);
            for (let i = 0; i < 7; i++) {
                $("<div />").text(opts.dayNames[i]).appendTo(dayLabels);
            }

            let dayWrapper = $("<div />").addClass(opts.classes.dayWrapper).appendTo(calendar);

            for (let i = 0; i < 42; i++) {
                $("<div />").addClass(opts.classes.day).attr("data-col", i % 7).appendTo(dayWrapper);
            }
        };

        /**
         * Gibt die Anzahl Tage des aktuellen Monats zurÃ¼ck
         *
         * @returns {number}
         */
        let daysInMonth = () => {
            let y = currentDate.getFullYear();
            let m = currentDate.getMonth() + 1;
            return m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);
        };

        /**
         * Gibt Infos zum Ã¼bergebenen Datum zurÃ¼ck
         *
         * @param int y
         * @param int m
         * @param int d
         * @returns {{inBounds: boolean, today: boolean}}
         */
        let getDateInfos = (y, m, d) => {
            let checkDate = {
                min: new Date(y, m, d, 23, 59, 59),
                max: new Date(y, m, d, 0, 0, 0)
            };

            let ret = {
                inBounds: true,
                today: false
            };

            if (now.getDate() === checkDate.min.getDate() && now.getMonth() === checkDate.min.getMonth() && now.getFullYear() === checkDate.min.getFullYear()) {
                ret.today = true;
            }

            if (opts.minDate !== null && opts.minDate > checkDate.min.getTime()) {
                ret.inBounds = false;
            } else if (opts.maxDate !== null && opts.maxDate < checkDate.max.getTime()) {
                ret.inBounds = false;
            }

            return ret;
        };


        /**
         * Passt die Html-Darstellung auf das aktuelle Datum an
         */
        let fillDays = () => {
            let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0).getDay() - 1;
            firstDay = firstDay < 0 ? firstDay + 7 : firstDay;

            let dayList = elm.find("div." + opts.classes.dayWrapper + " > div." + opts.classes.day);

            dayList.empty()
                .removeData("date")
                .addClass(opts.classes.dayEmpty)
                .removeClass(opts.classes.hidden)
                .removeClass(opts.classes.dayInactive)
                .removeClass(opts.classes.dayToday);

            let day = 1;
            let totalDays = daysInMonth();

            for (let i = firstDay; i < firstDay + totalDays; i++) {
                let dayElm = dayList.eq(i).removeClass(opts.classes.dayEmpty);
                let dateInfos = getDateInfos(currentDate.getFullYear(), currentDate.getMonth(), day);

                if (dateInfos.today) {
                    dayElm.addClass(opts.classes.dayToday);
                }

                if (dateInfos.inBounds) {
                    $("<a />")
                        .attr("href", "#")
                        .data("date", new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                        .text(day)
                        .appendTo(dayElm);
                } else {
                    dayElm.addClass(opts.classes.dayInactive);
                    $("<span />").text(day).appendTo(dayElm);
                }

                day++;
            }

            $.each([7, 14], (i, x) => { // die letzten ein oder zwei Reihen ausblenden wenn der Monat dort keine Tage besitzt
                let lastElements = dayList.slice(dayList.length - x);
                if (lastElements.filter("." + opts.classes.dayEmpty).length === x) {
                    lastElements.addClass(opts.classes.hidden);
                } else {
                    return false;
                }
            });
        };

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        /*
         * Getter
         */
        this.getCalendar = () => elm;
        this.getHeader = () => elm.find("header");
        this.getDayWrapper = () => elm.find("div." + opts.classes.dayWrapper);
        this.getDaysOfCurrentMonth = () => elm.find("div." + opts.classes.dayWrapper + " > div." + opts.classes.day).not("." + opts.classes.dayEmpty);
        this.getCurrentDate = () => currentDate;

        /*
         * Setter
         */
        this.setMonth = (month) => changeCurrentDate({month: month - 1});
        this.setYear = (year) => changeCurrentDate({year: year});
        this.setDate = (date) => changeCurrentDate({year: date.getFullYear(), month: date.getMonth()});
        this.navigateBack = (amount = 1) => changeCurrentDate({month: currentDate.getMonth() - amount});
        this.navigateForward = (amount = 1) => changeCurrentDate({month: currentDate.getMonth() + amount});
        this.gotoToday = () => {
            let todayInfos = getDateInfos(now.getFullYear(), now.getMonth(), now.getDate());
            if (todayInfos.inBounds) {
                changeCurrentDate({year: now.getFullYear(), month: now.getMonth()});
            }
        };

        /**
         * Initialisiert den Kalendar
         *
         * @param {object} options
         */
        this.run = options => {
            opts = $.extend(true, {}, defaults, options);

            currentDate = new Date(opts.startDate.getFullYear(), opts.startDate.getMonth(), 1);

            initHtml();
            initBounds();
            initEvents();
            fillDays();

            opts.onInited({
                calendar: this.getCalendar(),
                header: this.getHeader(),
                dayWrapper: this.getDayWrapper(),
                date: this.getCurrentDate(),
                daysOfCurrentMonth: this.getDaysOfCurrentMonth()
            });
        };

    };


    /**
     *
     * @param {object} options
     * @returns {jQuery}
     */
    $.fn.calendar = function (options) {

        if (this.length) {
            return this.each((k, elm) => {
                let calendarObj = new Calendar($(elm));
                calendarObj.run(options);
                $(this).data("calendar", calendarObj);
            });
        }
    };
    
})(jQuery);