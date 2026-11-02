import React, { useState } from 'react'
import { useOutletContext } from 'react-router';
import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants';

type UploadProps = {
    onComplete?: (base64: string) => void;
};

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = (fileToProcess?: File) => {
        if (!isSignedIn || !fileToProcess) return;

        setFile(fileToProcess);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                console.error('Unable to read the uploaded file as a Base64 string.');
                setFile(null);
                return;
            }

            const base64 = reader.result;
            let currentProgress = 0;
            const intervalId = window.setInterval(() => {
                currentProgress = Math.min(currentProgress + PROGRESS_STEP, 100);
                setProgress(currentProgress);

                if (currentProgress === 100) {
                    window.clearInterval(intervalId);
                    window.setTimeout(() => onComplete?.(base64), REDIRECT_DELAY_MS);
                }
            }, PROGRESS_INTERVAL_MS);
        };
        reader.onerror = () => {
            console.error('Unable to read the uploaded file.', reader.error);
            setFile(null);
            setProgress(0);
        };
        reader.readAsDataURL(fileToProcess);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        processFile(event.currentTarget.files?.[0]);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (isSignedIn) setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        processFile(event.dataTransfer.files[0]);
    };

  return (
    <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ?(
                                "Click or drag and drop to upload your image"
                            ) : (
                                "Please sign in or sign up to upload your image"
                            )}
                        </p>
                        <p className="help">Maximum file size: 50 MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check"/>
                            ) : (
                                <ImageIcon className="image"/>
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }}/>

                            <p className="status-text">
                                {progress < 100 ? `Analyzing Floor Plan...` : "Redirecting ..."}
                            </p>
                        </div>
                    </div>
                    </div>
            )}
    </div>
    );
}

export default Upload