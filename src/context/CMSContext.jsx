import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CMSContext = createContext();

export const CMSProvider = ({ children }) => {
    const [content, setContent] = useState({});
    const [slides, setSlides] = useState([]);
    const [template, setTemplate] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchCMS = async () => {
        try {
            const [cmsRes, slidesRes, templateRes] = await Promise.all([
                api.get('/cms'),
                api.get('/events/slides'),
                api.get('/templates/default')
            ]);
            setContent(cmsRes.data.data);
            setSlides(slidesRes.data.data);
            setTemplate(templateRes.data.data);
        } catch (err) {
            console.error('CMS fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCMS();
    }, []);

    return (
        <CMSContext.Provider value={{ content, slides, template, refreshCMS: fetchCMS, loading }}>
            {children}
        </CMSContext.Provider>
    );
};

export const useCMS = () => useContext(CMSContext);
