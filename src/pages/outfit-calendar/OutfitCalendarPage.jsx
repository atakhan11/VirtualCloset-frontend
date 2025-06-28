import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import az from 'date-fns/locale/az';
import { FaTrash, FaTimes, FaCalendarTimes } from 'react-icons/fa';
import './OutfitCalendarPage.css';

// =======================================================
// YARDIMÇI KOMPONENTLƏR VƏ FUNKSİYALAR
// =======================================================

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

const locales = { 'az': az };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

// Təqvimdəki hadisə üçün xüsusi görünüş
const CustomEvent = ({ event }) => {
    return (
        <div className="rbc-event-content-custom">
            {event.resource.items && event.resource.items[0] && (
                <img src={getImageUrl(event.resource.items[0].image)} alt="" className="rbc-event-image" />
            )}
            <span>{event.title}</span>
        </div>
    );
};

// Detal pəncərəsi (Modal)
const OutfitDetailModal = ({ event, onClose, onUnplan, onDelete }) => {
    if (!event) return null;
    const { resource: outfit } = event;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content calendar-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{outfit.name}</h2>
                <p>Planlanan tarix: {new Date(outfit.plannedDate).toLocaleDateString()}</p>
                <div className="modal-outfit-images">
                    {outfit.items.map(item => (
                        item && <img key={item._id} src={getImageUrl(item.image)} alt={item.name} title={item.name} />
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={() => onUnplan(outfit._id)} className="btn btn-secondary">
                        <FaCalendarTimes /> Planı Ləğv Et
                    </button>
                    <button onClick={() => onDelete(outfit._id)} className="btn btn-danger">
                        <FaTrash /> Kombini Sil
                    </button>
                </div>
                <button onClick={onClose} className="close-modal-btn"><FaTimes /></button>
            </div>
        </div>
    );
};

// =======================================================
// ƏSAS TƏQVİM KOMPONENTİ (YENİ MƏNTİQLƏ)
// =======================================================
const OutfitCalendarPage = () => {
    const [myOutfits, setMyOutfits] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Zəhmət olmasa, sistemə daxil olun.");
            
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/outfits', config);
            
            setMyOutfits(data);
            const calendarEvents = data
                .filter(outfit => outfit.isPlanned && outfit.plannedDate)
                .map(outfit => ({
                    title: outfit.name,
                    start: new Date(outfit.plannedDate),
                    end: new Date(outfit.plannedDate),
                    resource: outfit,
                }));
            setEvents(calendarEvents);
        } catch (err) {
            setError(err.message || 'Məlumatları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePlanOutfit = useCallback(async (outfit, newDate) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/outfits/${outfit._id}/plan`, { date: newDate }, config);
            await fetchData();
        } catch (error) {
            alert('Kombini planlaşdırarkən xəta baş verdi.');
        }
    }, [fetchData]);

    const handleUnplanOutfit = useCallback(async (outfitId) => {
        if (!window.confirm("Bu kombinin planını ləğv etməyə əminsiniz?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/outfits/${outfitId}/unplan`, {}, config);
            setSelectedEvent(null);
            await fetchData();
        } catch (error) {
            alert('Plan ləğv edilərkən xəta baş verdi.');
        }
    }, [fetchData]);

    const handleDeleteOutfit = useCallback(async (outfitId) => {
        if (!window.confirm("Bu kombini birdəfəlik silməyə əminsinizmi?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/outfits/${outfitId}`, config);
            setSelectedEvent(null);
            await fetchData();
        } catch (error) {
            alert('Kombin silinərkən xəta baş verdi.');
        }
    }, [fetchData]);

    const handleEventDrop = useCallback(async ({ event, start }) => {
        handlePlanOutfit(event.resource, start);
    }, [handlePlanOutfit]);

    // YENİ MƏNTİQ: HTML Drag-and-Drop API istifadə edirik
    const handleDragStart = (e, outfit) => {
        e.dataTransfer.setData("text/plain", outfit._id);
    };

    const handleDropFromOutside = useCallback(async ({ start }) => {
        const outfitId = window.draggedOutfitId;
        if (outfitId) {
            const outfitToPlan = myOutfits.find(o => o._id === outfitId);
            if (outfitToPlan) {
                handlePlanOutfit(outfitToPlan, start);
            }
            window.draggedOutfitId = null; // Yaddaşı təmizləyirik
        }
    }, [myOutfits, handlePlanOutfit]);

    if (loading) return <p className="page-status">Yüklənir...</p>;
    if (error) return <p className="page-status error">{error}</p>;
    
    const unplannedOutfits = myOutfits.filter(outfit => !outfit.isPlanned);

    return (
        <div className="calendar-page-container">
            <div className="calendar-sidebar">
                <h3>Planlanmamış Kombinlər</h3>
                <p>Planlamaq üçün kombini sürükləyib təqvimə atın.</p>
                <div className="unplanned-outfits-list">
                    {unplannedOutfits.length > 0 ? (
                        unplannedOutfits.map(outfit => 
                            <div 
                                key={outfit._id} 
                                className="unplanned-outfit-item"
                                draggable="true" // Sürüklənə bilən edirik
                                onDragStart={(e) => {
                                    // Sürüklənən kombinin ID-sini yadda saxlayırıq
                                    window.draggedOutfitId = outfit._id;
                                }}
                            >
                                {outfit.name}
                            </div>
                        )
                    ) : (
                        <p className="no-outfits-message">Bütün kombinlər planlanıb!</p>
                    )}
                </div>
            </div>
            <div className="calendar-main">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 'calc(100vh - 90px)' }}
                    culture='az'
                    onEventDrop={handleEventDrop}
                    onDropFromOutside={handleDropFromOutside}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                    components={{ event: CustomEvent }}
                    date={date}
                    view={view}
                    onNavigate={setDate}
                    onView={setView}
                    messages={{
                        next: "Növbəti", previous: "Əvvəlki", today: "Bugün",
                        month: "Ay", week: "Həftə", day: "Gün", agenda: "Gündəlik"
                    }}
                />
            </div>
            <OutfitDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onUnplan={handleUnplanOutfit}
                onDelete={handleDeleteOutfit}
            />
        </div>
    );
};

// DndProvider artıq lazım deyil
export default OutfitCalendarPage;
