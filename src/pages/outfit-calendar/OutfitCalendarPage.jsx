import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import az from 'date-fns/locale/az';
import './OutfitCalendarPage.css';

// date-fns üçün localizer qurulumu
const locales = {
  'az': az,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const OutfitCalendarPage = () => {
    const [myOutfits, setMyOutfits] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Təqvimin vəziyyətini idarə etmək üçün state-lər
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');

    // Dataları backend-dən çəkən funksiya
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Zəhmət olmasa, sistemə daxil olun.");
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/outfits', config);
            
            // Bütün kombinləri saxlayırıq
            setMyOutfits(data);

            // Planlanmış kombinləri təqvimin başa düşdüyü formata çeviririk
            const calendarEvents = data
                .filter(outfit => outfit.isPlanned && outfit.plannedDate)
                .map(outfit => ({
                    title: outfit.name,
                    start: new Date(outfit.plannedDate),
                    end: new Date(outfit.plannedDate),
                    resource: outfit, // Bütün kombin məlumatını saxlayırıq
                }));
            setEvents(calendarEvents);

        } catch (err) {
            setError('Məlumatları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    }, []); // fetchData-nı useCallback ilə optimallaşdırırıq

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Təqvimin naviqasiya funksiyaları
    const handleNavigate = useCallback((newDate) => setCurrentDate(newDate), [setCurrentDate]);
    const handleView = useCallback((newView) => setView(newView), [setView]);

    // Təqvimdəki boş bir günə kliklədikdə işə düşür
    const handleSelectSlot = async ({ start }) => {
        if (!selectedOutfit) {
            alert('Zəhmət olmasa, əvvəlcə təqvimə əlavə etmək istədiyiniz kombini seçin.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/outfits/${selectedOutfit._id}/plan`, { date: start }, config);
            
            alert(`"${selectedOutfit.name}" kombini təqvimə əlavə edildi!`);
            setSelectedOutfit(null); // Seçimi təmizləyirik
            await fetchData(); // Təqvimi yeniləyirik

        } catch (error) {
            alert('Kombini planlaşdırarkən xəta baş verdi.');
        }
    };
    
    if (loading) return <p className="page-status">Yüklənir...</p>;
    if (error) return <p className="page-status error">{error}</p>;
    
    // Yalnız planlanmamış kombinləri yan paneldə göstərmək üçün filterləyirik
    const unplannedOutfits = myOutfits.filter(outfit => !outfit.isPlanned);

    return (
        <div className="calendar-page-container">
            <div className="calendar-sidebar">
                <h3>Planlanmamış Kombinlər</h3>
                <p>Planlamaq üçün kombin seçin, sonra təqvimdə bir günə klikləyin.</p>
                <div className="unplanned-outfits-list">
                    {unplannedOutfits.length > 0 ? (
                        unplannedOutfits.map(outfit => (
                            <div 
                                key={outfit._id} 
                                className={`unplanned-outfit-item ${selectedOutfit?._id === outfit._id ? 'selected' : ''}`}
                                onClick={() => setSelectedOutfit(outfit)}
                            >
                                {outfit.name}
                            </div>
                        ))
                    ) : (
                        <p className="no-outfits-message">Bütün kombinlər planlanıb!</p>
                    )}
                </div>
            </div>
            <div className="calendar-main">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 'calc(100vh - 110px)' }}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    culture='az'
                    date={currentDate}
                    view={view}
                    onNavigate={handleNavigate}
                    onView={handleView}
                    messages={{
                        next: "Növbəti",
                        previous: "Əvvəlki",
                        today: "Bugün",
                        month: "Ay",
                        week: "Həftə",
                        day: "Gün",
                        agenda: "Gündəlik"
                    }}
                />
            </div>
        </div>
    );
};

export default OutfitCalendarPage;
