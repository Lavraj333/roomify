import {useLocation, useNavigate} from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;

    if (typeof error === "object" && error !== null && "message" in error) {
        const message = error.message;
        const code = "code" in error ? error.code : undefined;
        if (typeof message === "string") {
            return typeof code === "string" ? `${message} (${code})` : message;
        }
    }

    return "An unexpected error occurred.";
};

const VisualizerId = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialImage, initialRendered, name } = location.state || {};

    const hasInitialGenerated = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRendered || null);
    
    const handleBack = () => navigate('/');

    const runGeneration = useCallback(async () => {
        if (!initialImage) return;

        try {
            setGenerationError(null);
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: initialImage });

            if (!result.renderedImage) {
                throw new Error("The image service returned no rendered image.");
            }

            setCurrentImage(result.renderedImage);
        } catch (error) {
            console.error("Generation failed:", error);
            setGenerationError(`Rendering failed: ${getErrorMessage(error)}`);
        } finally {
            setIsProcessing(false);
        }
    }, [initialImage]);

    useEffect(() => {
        if (!initialImage || initialRendered || hasInitialGenerated.current) return;
        hasInitialGenerated.current = true;
        void runGeneration();
    }, [initialImage, initialRendered, runGeneration]);

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo" />
                    <span className="name">Roomify</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                    <X className="icon" />Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{name || "Untitled Project"}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <Button 
                                size="sm"
                                onClick={() => {}}
                                className="export"
                                disabled={!currentImage}>
                                    <Download className="w-4 h-4 mr-2" />Export
                                </Button>

                             <Button 
                                size="sm"
                                onClick={() => {}}
                                className="share">
                                    <Share2 className="w-4 h-4 mr-2" />Share
                                </Button>
                                   
                        </div>
                    </div>

                    <div className={`render-area ${isProcessing ? 'is-processing':''}`}>
                        {currentImage ? (
                            <img src={currentImage} alt = "AI Render" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {initialImage && (
                                    <img src={initialImage} alt="Original" className="render-fallback" />
                                )}
                                </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering ...</span>
                                    <span className="subtitle">Generating your 3D visualization</span>
                                    </div>
                                </div>
                        )}

                        {generationError && (
                            <div className="render-error" role="alert">
                                <p>{generationError}</p>
                                <Button size="sm" onClick={() => void runGeneration()}>
                                    Retry
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </section>
        </div>
    );

}   
export default VisualizerId;