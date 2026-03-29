import React from "react";
import {
    Popover, Pane, Text, Heading, Button, IconButton, Badge, Position,
    CircleArrowUpIcon, TickCircleIcon, CrossIcon, BanCircleIcon,
    Checkbox,
    CleanIcon,
    TrashIcon
} from "evergreen-ui";
import { useUploadProgress } from "./UploadProgressContext";
import ProgressBar from "./progressbar/ProgressBar";

/**
 * Shows an icon in the toolbar whenever uploads are tracked.
 * Clicking the icon opens a popover with a per-file progress list.
 */
export default function DavUploadProgressIndicator() {
    const { uploads, clearCompleted } = useUploadProgress();

    if (uploads.length === 0) {
        return null;
    }

    const activeCount = uploads.filter(u => u.status === 'pending' || u.status === 'uploading').length;

    const statusIcon = (status) => {
        switch (status) {
            case 'done':    return <TickCircleIcon color="success" size={12} />;
            case 'error':   return <BanCircleIcon  color="danger"  size={12} />;
            case 'exists':  return <CrossIcon      color="warning" size={12} />;
            default:        return null;
        }
    };

    const barColor = (status) => {
        switch (status) {
            case 'done':    return '#52BD94'; // green
            case 'error':   return '#D14343'; // red
            case 'exists':  return '#FFB020'; // orange/warning
            default:        return '#5C85FF'; // blue (in progress)
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <Popover
            position={Position.BOTTOM_RIGHT}
            content={
                <Pane padding={16} minWidth={340} maxWidth={380}>
                    <Pane display="flex" justifyContent="space-between" alignItems="center" marginBottom={12}>
                        <Heading size={400}>
                            {activeCount > 0
                                ? `Uploading ${activeCount} file${activeCount > 1 ? 's' : ''}…`
                                : 'Uploads complete'}
                        </Heading>
                        <IconButton icon={TrashIcon} intent="default" appearance="minimal" size="small" onClick={clearCompleted} />
                    </Pane>

                    {uploads.map(upload => (
                        <Pane key={upload.id} marginBottom={10}>
                            <Pane display="flex" alignItems="center" justifyContent="space-between" marginBottom={3}>
                                <Text
                                    size={300}
                                    flex={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    marginRight={8}
                                    title={upload.fileName}
                                >
                                    {upload.fileName}
                                </Text>
                                <Pane display="flex" alignItems="center" gap={4} flexShrink={0}>
                                    {statusIcon(upload.status)}
                                    <Text size={300} color="muted">
                                        {upload.status === 'done'
                                            ? formatBytes(upload.total)
                                            : upload.status === 'error'
                                            ? 'Error'
                                            : upload.status === 'exists'
                                            ? 'Exists'
                                            : upload.total > 0
                                            ? `${formatBytes(upload.loaded)} / ${formatBytes(upload.total)}`
                                            : `${upload.percent}%`}
                                    </Text>
                                </Pane>
                            </Pane>
                            <ProgressBar
                                size="tiny"
                                value={upload.percent}
                                max={100}
                                color={barColor(upload.status)}
                            />
                        </Pane>
                    ))}
                </Pane>
            }
        >
            {/* Trigger: icon button with an active-count badge */}
            <Pane position="relative" display="inline-flex" alignItems="center" marginRight={10}>
                <IconButton
                    icon={CircleArrowUpIcon}
                    intent={activeCount > 0 ? 'warning' : 'success'}
                    appearance="default"
                    title="Upload progress"
                />
                {activeCount > 0 && (
                    <Badge
                        color="blue"
                        position="absolute"
                        top={2}
                        right={2}
                        paddingX={4}
                        fontSize={9}
                        lineHeight="14px"
                        pointerEvents="none"
                    >
                        {activeCount}
                    </Badge>
                )}
            </Pane>
        </Popover>
    );
}
