import React, { useState, useCallback, useMemo, useContext } from "react";

/**
 * Context for tracking upload progress across the application.
 * Each entry in `uploads` has the shape:
 *   { id, fileName, loaded, total, percent, status: 'pending'|'uploading'|'done'|'error'|'exists' }
 */
const UploadProgressContext = React.createContext({
    uploads: [],
    addUpload: () => {},
    updateUpload: () => {},
    completeUpload: () => {},
    clearCompleted: () => {}
});

export function UploadProgressProvider({ children }) {
    const [uploads, setUploads] = useState([]);

    // Register a new upload entry before it starts
    const addUpload = useCallback((id, fileName) => {
        setUploads(prev => [...prev, { id, fileName, loaded: 0, total: 0, percent: 0, status: 'pending' }]);
    }, []);

    // Update progress while the upload is ongoing
    const updateUpload = useCallback((id, loaded, total) => {
        const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
        setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, loaded, total, percent, status: 'uploading' } : u
        ));
    }, []);

    // Mark an upload as finished with a final status
    const completeUpload = useCallback((id, status) => {
        setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, percent: status === 'done' ? 100 : u.percent, status } : u
        ));
    }, []);

    // Remove entries that are no longer active (done / error / exists)
    const clearCompleted = useCallback(() => {
        setUploads(prev => prev.filter(u => u.status === 'pending' || u.status === 'uploading'));
    }, []);

    const value = useMemo(
        () => ({ uploads, addUpload, updateUpload, completeUpload, clearCompleted }),
        [uploads, addUpload, updateUpload, completeUpload, clearCompleted]
    );

    return (
        <UploadProgressContext.Provider value={value}>
            {children}
        </UploadProgressContext.Provider>
    );
}

export const useUploadProgress = () => useContext(UploadProgressContext);

export default UploadProgressContext;
