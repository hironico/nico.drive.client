import React, { useCallback, useState } from "react";
import { FileUploader, Pane, Alert, majorScale } from "evergreen-ui";
import { useUploadProgress } from "./UploadProgressContext";

/**
 * DavFileUploadPane
 *
 * A minimal drop-zone that lets the user pick files.
 * As soon as files are accepted they are handed off to UploadProgressContext
 * (which drives all XHR work) and the pane closes immediately.
 *
 * No FileCards are rendered — progress is tracked in the toolbar indicator.
 * Uploads are never interrupted by closing this pane.
 */
export default function DavFileUploadPane({ handleClose, currentDirectory }) {
    const maxFiles       = 10000;
    const maxSizeInMB    = 5000;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    // Only track rejections so we can show error messages
    const [fileRejections, setFileRejections] = useState([]);

    const { queueFiles } = useUploadProgress();

    const handleAccepted = useCallback((newFiles) => {
        if (!newFiles?.length) return;
        // Hand off to the context — queueFiles also opens the progress popover
        queueFiles(newFiles, currentDirectory);
        // Close the slide pane immediately; uploads continue in the background
        handleClose();
    }, [queueFiles, currentDirectory, handleClose]);

    return (
        <Pane padding={10} justifySelf="stretch" alignSelf="stretch"
              display="grid" justifyContent="stretch" alignItems="start">

            {/* Rejection alerts shown above the drop zone */}
            {fileRejections.map((rejection, i) => (
                <Alert
                    key={i}
                    intent="danger"
                    title={rejection.file.name}
                    marginBottom={majorScale(1)}
                >
                    {rejection.message}
                </Alert>
            ))}

            <FileUploader
                label="Upload Files"
                description={`Drag and drop files here, or click to browse. Files can be up to ${maxSizeInMB} MB.`}
                maxSizeInBytes={maxSizeInBytes}
                maxFiles={maxFiles}
                onAccepted={handleAccepted}
                onRejected={setFileRejections}
                // values is intentionally empty — file cards are not shown here;
                // progress is tracked in the toolbar popover instead.
                values={[]}
            />
        </Pane>
    );
}
