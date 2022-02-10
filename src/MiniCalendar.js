export const MiniCalendar = (props) => {
    var eventList = props.eventList;

    function getWeek(d) {
        let date = new Date(d);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }

    function dispatchEvent(nbr) {
        // récup le nbr du jour réel
        let offset = new Date(props.year, props.month - 1, 1).getDay();
        if (offset === 0) {
            offset = 7;
        }
        offset = offset - 1;
        let start_date = new Date(props.year, props.month - 1, nbr - offset).getTime() / 1000;
        let end_date = new Date(props.year, props.month - 1, nbr - offset, 23, 59, 59).getTime() / 1000;
        let tempStockage = [];
        for (let i = 0; i < eventList.length; i++) {
            let event = eventList[i];
            if (event["blank"] !== true) {
                if (event["start_date"] >= start_date && event["start_date"] <= end_date) {
                    tempStockage.push(event);
                } else if (event["end_date"] >= start_date && event["end_date"] <= end_date) {
                    tempStockage.push(event);
                } else if (event["start_date"] <= start_date && event["end_date"] >= end_date) {
                    tempStockage.push(event);
                }
            }
        }

        return tempStockage;
    }

    function getJour(nbr) {
        var offsetbeggin = new Date(props.year, props.month - 1, 0).getDay();
        var day = new Date(props.year, props.month - 1, nbr - offsetbeggin);
        return day;
    }
    // function getMoinsJour(date) {
    //     var day = new Date(props.year, props.month, 0).getDay();
    //     if (day === 0) {
    //         day = 7
    //     }
    //     day = day - 2
    //     return date.getDate() + day
    // }

    const MiniJour = (props) => {
        var gris = false;
        const today = new Date();
        var selected = false;
        if (props.premier) {
            if (getJour(props.day).getDate() > 15) {
                gris = true;
            }
        }
        if (props.dernier) {
            if (getJour(props.day).getDate() < 15) {
                gris = true;
            }
        }
        var mois = today.getMonth();
        mois = mois + 1;
        if (getJour(props.day).getDate() === today.getDate()) {
            if (props.month === mois) {
                selected = true;
            }
            if (props.premier && getJour(props.day).getDate() > 15) {
                selected = false;
            }
            if (props.dernier && getJour(props.day).getDate() < 15) {
                selected = false;
            }
        }

        var events = dispatchEvent(props.day);
        var nbrDot = events.length;

        return (
            <div className={selected ? "mini-jour mini-selected" : "mini-jour"} style={{ color: gris ? "#49505550" : "#111B22" }}>
                <p className={events.length <= 0 ? "mini-none-p" : null} style={{ transform: "translateY(0)" }}>
                    {getJour(props.day).getDate()}
                </p>
                <div className="mini-dot">
                    {events[0] !== undefined ? (
                        <div
                            className="mini-dot1"
                            style={{
                                backgroundColor: events[0]["color"],
                            }}></div>
                    ) : null}
                    {events[1] !== undefined ? (
                        <div
                            className="mini-dot2"
                            style={{
                                backgroundColor: events[1]["color"],
                            }}></div>
                    ) : null}
                </div>
            </div>
        );
    };

    const Line = (props) => {
        var classNom = props.annim + " mini-line ";
        var thisW = getWeek(new Date(props.year, props.month - 1, props.offset + 1));
        if (thisW === props.nowWeek && props.sele) {
            classNom = classNom.concat("mini-line-sele");
        }

        return (
            <div className={classNom}>
                <MiniJour month={props.month} day={1 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={2 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={3 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={4 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={5 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={6 + props.offset} premier={props.premier} dernier={props.dernier} />
                <MiniJour month={props.month} day={7 + props.offset} premier={props.premier} dernier={props.dernier} />
            </div>
        );
    };
    const monthConv = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    };

    return (
        <div className="mini-calendar">
            <div className="mini-top">
                <h2>
                    {monthConv[props.month]} {props.year}{" "}
                </h2>
                <div className="mini-nav">
                    <h2 className="mini-nav-prev" onClick={() => props.prevMonth()}>
                        &#60;
                    </h2>
                    <h2 className="mini-nav-next" onClick={() => props.nextMonth()}>
                        &#62;
                    </h2>
                </div>
            </div>
            <Line annim={props.annim} month={props.month} year={props.year} sele={props.isSele} nowWeek={props.week} offset={0} premier={true} dernier={false} />
            <Line annim={props.annim} month={props.month} year={props.year} sele={props.isSele} nowWeek={props.week} offset={7} premier={false} dernier={false} />
            <Line annim={props.annim} month={props.month} year={props.year} sele={props.isSele} nowWeek={props.week} offset={14} premier={false} dernier={false} />
            <Line annim={props.annim} month={props.month} year={props.year} sele={props.isSele} nowWeek={props.week} offset={21} premier={false} dernier={false} />
            <Line annim={props.annim} month={props.month} year={props.year} sele={props.isSele} nowWeek={props.week} offset={28} premier={false} dernier={true} />
        </div>
    );
};
