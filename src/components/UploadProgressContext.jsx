import React, { useState, useCallback, useMemo, useContext, useRef } from "react";
import { toaster } from "evergreen-ui";
import { useDavConfigurationContext } from "../AppSettings";

/**
 * Context for tracking and driving file uploads.
 *
 * Public API:
 *   uploads        – array of { id, fileName, loaded, total, percent,
 *                               status: 'pending'|'uploading'|'done'|'error'|'exists' }
 *   queueFiles(files, currentDirectory) – enqueue File objects for upload;
 *                                         returns the array of assigned upload IDs,
 *                                         and automatically opens the progress popover
 *   clearCompleted()     – remove finished entries from the list
 *   isPopoverOpen        – whether the toolbar progress popover should be visible
 *   openPopover()        – force the popover open (e.g. right after queuing files)
 *   closePopover()       – close the popover
 *   setOnUploadDone(fn)  – register a callback invoked as fn(directory) each time a
 *                          file upload finishes successfully; only the last registered
 *                          callback is kept (use the UploadDoneHandler helper)
 *
 * The actual XHR work runs inside this context so uploads survive the unmounting
 * of DavUploadPane (e.g. when the slide pane is closed).
 */
const UploadProgressContext = React.createContext({
    uploads: [],
    queueFiles: () => [],
    clearCompleted: () => {},
    isPopoverOpen: false,
    openPopover: () => {},
    closePopover: () => {},
    setOnUploadDone: () => {}
});

export function UploadProgressProvider({ children }) {
    const [uploads, setUploads] = useState([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const openPopover  = useCallback(() => setIsPopoverOpen(true),  []);
    const closePopover = useCallback(() => setIsPopoverOpen(false), []);

    // Internal processing state — intentionally NOT in React state to avoid
    // triggering re-renders from inside the XHR callbacks.
    const queueRef        = useRef([]); // items waiting to be processed
    const isProcessingRef = useRef(false);

    // Always-current reference to the processor function to avoid stale closures
    // inside XHR event handlers that close over it.
    const processNextRef  = useRef(null);

    // External callback: called with (directory) whenever a file finishes uploading
    // successfully. Registered by UploadDoneHandler in DavToolBar so it always has
    // the freshest currentDirectory from props.
    const onUploadDoneRef = useRef(null);
    const setOnUploadDone = useCallback((fn) => { onUploadDoneRef.current = fn; }, []);

    const davConfigurationContext = useDavConfigurationContext();

    // ─── helpers that update the uploads state ───────────────────────────────

    const setProgress = (id, loaded, total) => {
        const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
        setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, loaded, total, percent, status: 'uploading' } : u
        ));
    };

    const setStatus = (id, finalStatus) => {
        setUploads(prev => prev.map(u =>
            u.id === id
                ? { ...u, percent: finalStatus === 'done' ? 100 : u.percent, status: finalStatus }
                : u
        ));
    };

    // ─── queue processor ─────────────────────────────────────────────────────

    // Defined as a plain assignment to processNextRef.current so that recursive
    // calls inside XHR handlers always invoke the latest version.
    processNextRef.current = () => {
        if (isProcessingRef.current || queueRef.current.length === 0) return;

        const item = queueRef.current[0];
        isProcessingRef.current = true;

        const { id, file, targetFileName, fullUrl, davClient } = item;

        const finish = (finalStatus) => {
            queueRef.current.shift();          // dequeue the finished item
            isProcessingRef.current = false;
            setStatus(id, finalStatus);
            // Schedule next file on a fresh microtask to avoid deep synchronous stacks
            setTimeout(() => processNextRef.current(), 0);
        };

        // Per RFC 4918, Overwrite only applies to COPY/MOVE.
        // Use exists() to detect duplicates before attempting the PUT.
        davClient.exists(targetFileName)
            .then(alreadyExists => {
                if (alreadyExists) {
                    toaster.warning(`File "${file.name}" already exists on the server.`);
                    finish('exists');
                    return;
                }

                // XHR gives us upload progress events; sending a File object
                // directly still streams it without buffering in RAM.
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        setProgress(id, event.loaded, event.total);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log(`[upload] ${file.name} → done`);
                        // Notify the directory-refresh handler before marking as done
                        onUploadDoneRef.current?.(item.directory);
                        finish('done');
                    } else {
                        toaster.danger(`Error uploading "${file.name}": HTTP ${xhr.status}`);
                        finish('error');
                    }
                });

                xhr.addEventListener('error', () => {
                    toaster.danger(`Network error while uploading "${file.name}"`);
                    finish('error');
                });

                xhr.open('PUT', fullUrl);
                xhr.withCredentials = true;   // send session cookie
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.send(file);               // streams the file, no in-memory copy
            })
            .catch(error => {
                toaster.danger(`Could not start upload of "${file.name}": ${error}`);
                finish('error');
            });
    };

    // ─── public API ──────────────────────────────────────────────────────────

    /**
     * Enqueue an array of File objects for upload into `currentDirectory`.
     * Returns the list of upload IDs assigned to the files so callers can
     * track their specific batch.
     */
    const queueFiles = useCallback((files, currentDirectory) => {
        if (!files?.length) return [];
        if (!davConfigurationContext?.selectedUserRootDirectory) {
            console.error('queueFiles: no DAV connection available');
            return [];
        }

        const { davClient, url } = davConfigurationContext.selectedUserRootDirectory;
        const baseUrl = url.replace(/\/$/, '');

        const items = files.map(file => {
            const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const targetFileName = `${currentDirectory}/${file.name}`.replace(/\/\/+/g, '/');
            const fullUrl = `${baseUrl}${targetFileName}`.replace(/([^:])\/\/+/g, '$1/');
            // directory is stored so the completion handler knows where the file landed
            return { id, file, fileName: file.name, targetFileName, fullUrl, davClient, directory: currentDirectory };
        });

        // Register all items in state as 'pending' before any XHR starts
        setUploads(prev => [
            ...prev,
            ...items.map(({ id, fileName, file }) => ({
                id, fileName,
                loaded: 0, total: file.size, percent: 0,
                status: 'pending'
            }))
        ]);

        // Push into the processing queue and start the processor if idle
        queueRef.current.push(...items);
        processNextRef.current();

        // Open the toolbar progress popover so the user can see progress immediately
        setIsPopoverOpen(true);

        return items.map(i => i.id);
    }, [davConfigurationContext]);

    /** Remove entries that have reached a terminal state */
    const clearCompleted = useCallback(() => {
        setUploads(prev =>
            prev.filter(u => u.status === 'pending' || u.status === 'uploading')
        );
    }, []);

    const value = useMemo(
        () => ({ uploads, queueFiles, clearCompleted, isPopoverOpen, openPopover, closePopover, setOnUploadDone }),
        [uploads, queueFiles, clearCompleted, isPopoverOpen, openPopover, closePopover, setOnUploadDone]
    );

    return (
        <UploadProgressContext.Provider value={value}>
            {children}
        </UploadProgressContext.Provider>
    );
}

export const useUploadProgress = () => useContext(UploadProgressContext);

export default UploadProgressContext;
