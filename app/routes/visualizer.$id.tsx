import { useNavigate, useOutletContext, useParams } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/puter.action";

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
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useOutletContext<AuthContext>();

    const hasInitialGenerated = useRef(false);
    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    
    const handleBack = () => navigate('/');

    const runGeneration = useCallback(async (item : DesignItem) => {
        if (!id || !item.sourceImage) return;

        try {
            setStatusError(null);
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: item.sourceImage });

            if (!result.renderedImage) {
                throw new Error("The image service returned no rendered image.");
            }

            setCurrentImage(result.renderedImage);

            const updatedItem: DesignItem = {
                ...item,
                renderedImage: result.renderedImage,
                renderedPath: result.renderedPath,
                timestamp: Date.now(),
                ownerId: item.ownerId ?? userId ?? null,
                isPublic: item.isPublic ?? false,
            };

            const saved = await createProject({ item: updatedItem, visibility: "private" });
            if (saved) {
                setProject(saved);
                setCurrentImage(saved.renderedImage || result.renderedImage);
            } else {
                setStatusError("The render completed, but the project could not be saved.");
            }
        } catch (error) {
            console.error("Generation failed:", error);
            setStatusError(`Rendering failed: ${getErrorMessage(error)}`);
        } finally {
            setIsProcessing(false);
        }
    }, [id, userId]);

   useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      try {
        const fetchedProject = await getProjectById({ id });

        if (!isMounted) return;

        setProject(fetchedProject ?? null);
        setCurrentImage(fetchedProject?.renderedImage || null);
        if (!fetchedProject) {
          setStatusError("This project could not be loaded. It may not exist or you may not be signed in.");
        } else {
          setStatusError(null);
        }
        hasInitialGenerated.current = false;
      } finally {
        if (isMounted) setIsProjectLoading(false);
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading, runGeneration]);

  const handleExport = async () => {
    if (!currentImage) return;

    try {
      setStatusError(null);
      const response = await fetch(currentImage);
      if (!response.ok) throw new Error(`Image download failed (${response.status}).`);

      const image = await response.blob();
      const extension = image.type.split("/")[1]?.split(";")[0] || "png";
      const downloadUrl = URL.createObjectURL(image);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${project?.name || `Residence ${id}`}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      console.error("Image export failed:", error);
      setStatusError(`Export failed: ${getErrorMessage(error)}`);
    }
  };

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
                            <h2>{project?.name || `Residence ${id}`}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <Button 
                                size="sm"
                                onClick={() => void handleExport()}
                                className="export"
                                disabled={!currentImage}>
                                    <Download className="w-4 h-4 mr-2" />Export
                                </Button>

                             <Button
                                size="sm"
                                disabled
                                title="Project sharing is not available yet"
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
                                {project?.sourceImage && (
                                    <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                                )}
                                {!isProjectLoading && !project && (
                                    <p role="status">Project unavailable.</p>
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

                        {statusError && (
                            <div className="render-error" role="alert">
                                <p>{statusError}</p>
                                <Button
                                    size="sm"
                                    onClick={() => project && void runGeneration(project)}
                                    disabled={!project?.sourceImage || isProcessing}
                                >
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