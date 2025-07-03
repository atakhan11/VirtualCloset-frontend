import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { FaTrash, FaTimes, FaCalendarTimes } from 'react-icons/fa';
import './OutfitCalendarPage.css';

const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
};

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

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

const OutfitDetailModal = ({ event, onClose, onUnplan, onDelete }) => {
    if (!event) return null;
    const { resource: outfit } = event;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content calendar-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{outfit.name}</h2>
                <p>Planned Date: {new Date(outfit.plannedDate).toLocaleDateString()}</p>
                <div className="modal-outfit-images">
                    {outfit.items.map(item => (
                        item && <img key={item._id} src={getImageUrl(item.image)} alt={item.name} title={item.name} />
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={() => onUnplan(outfit._id)} className="btn btn-secondary">
                        <FaCalendarTimes /> Unplan
                    </button>
                    <button onClick={() => onDelete(outfit._id)} className="btn btn-danger">
                        <FaTrash /> Delete Outfit
                    </button>
                </div>
                <button onClick={onClose} className="close-modal-btn"><FaTimes /></button>
            </div>
        </div>
    );
};

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
            if (!token) throw new Error("Please log in to the system.");
            
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
            setError(err.message || 'Failed to load data.');
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
            alert('An error occurred while planning the outfit.');
        }
    }, [fetchData]);

    const handleUnplanOutfit = useCallback(async (outfitId) => {
        if (!window.confirm("Are you sure you want to unplan this outfit?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/outfits/${outfitId}/unplan`, {}, config);
            setSelectedEvent(null);
            await fetchData();
        } catch (error) {
            alert('An error occurred while unplanning.');
        }
    }, [fetchData]);

    const handleDeleteOutfit = useCallback(async (outfitId) => {
        if (!window.confirm("Are you sure you want to permanently delete this outfit?")) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/outfits/${outfitId}`, config);
            setSelectedEvent(null);
            await fetchData();
        } catch (error) {
            alert('An error occurred while deleting the outfit.');
        }
    }, [fetchData]);

    const handleEventDrop = useCallback(async ({ event, start }) => {
        handlePlanOutfit(event.resource, start);
    }, [handlePlanOutfit]);

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
            window.draggedOutfitId = null;
        }
    }, [myOutfits, handlePlanOutfit]);

    if (loading) return <p className="page-status">Loading...</p>;
    if (error) return <p className="page-status error">{error}</p>;
    
    const unplannedOutfits = myOutfits.filter(outfit => !outfit.isPlanned);

    return (
        <div className="calendar-page-container">
            <div className="calendar-sidebar">
                <h3>Unplanned Outfits</h3>
                <p>Drag and drop an outfit to the calendar to plan it.</p>
                <div className="unplanned-outfits-list">
                    {unplannedOutfits.length > 0 ? (
                        unplannedOutfits.map(outfit => 
                            <div 
                                key={outfit._id} 
                                className="unplanned-outfit-item"
                                draggable="true" 
                                onDragStart={(e) => {
                                    window.draggedOutfitId = outfit._id;
                                }}
                            >
                                {outfit.name}
                            </div>
                        )
                    ) : (
                        <p className="no-outfits-message">All outfits are planned!</p>
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
                    culture='en-US'
                    onEventDrop={handleEventDrop}
                    onDropFromOutside={handleDropFromOutside}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                    components={{ event: CustomEvent }}
                    date={date}
                    view={view}
                    onNavigate={setDate}
                    onView={setView}
                    messages={{
                        next: "Next", previous: "Previous", today: "Today",
                        month: "Month", week: "Week", day: "Day", agenda: "Agenda"
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

export default OutfitCalendarPage;