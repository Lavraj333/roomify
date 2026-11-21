import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import { ArrowRight, Layers,Clock } from "lucide-react";
import Button from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { Link, useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useOutletContext<AuthContext>();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const isCreatingProjectRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSignedIn) {
      setProjects([]);
      setIsLoadingProjects(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingProjects(true);
    getProjects()
      .then((loadedProjects) => {
        if (isMounted) {
          setProjects(
            loadedProjects.sort((a, b) => b.timestamp - a.timestamp),
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingProjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isSignedIn]);

  const handleUploadComplete = async (base64: string) => {
    try{
      if(isCreatingProjectRef.current) return false;
    isCreatingProjectRef.current = true;
    const newid = Date.now().toString();
    const name = `Residence ${newid}`;

    const newItem = {
      id: newid, name, sourceImage: base64,
      renderedImage: undefined, 
      timestamp: Date.now(),
    }
    const saved = await createProject({ item: newItem, visibility: "private" });

    if (!saved) {
      console.error("Failed to create project:", newItem);
      return false;
    }

    setProjects((prev) =>[saved, ...prev]);

    navigate(`/visualizer/${newid}`, 
      { state: { 
        initialImage:  saved.sourceImage,
        initialRendered: saved.renderedImage || null,
        name
      } });
      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  return  (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Announcing Roomify 1.0.0</p>
          </div>
          <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

          <p className="subtitle">
            Roomify is an AI-first design environment that empowers creators to build stunning spaces with unprecedented speed and ease.
          </p>

          <div className="actions">
            <a href="#upload" className="cta"> 
              Start Building <ArrowRight className="icon" />
            </a>

            <Button variant="outline" size="lg" className="demo">Watch Demo</Button>
          </div>

          <div id="upload" className="upload-shell">
            <div className="grid-overlay"/>

            <div className="upload-card">
              <div className="upload-head">
                <div className="upload-icon">
                  <Layers className="icon" />
                  </div>
                  <h3>Upload your floor plan</h3>
                  <p>Supports JPG, PNG, formats upto 10MB</p>
              </div>
              <Upload onComplete={handleUploadComplete} />
            </div>
          </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and shared community projects, all in one place.</p>
            </div>
            </div>
          <div className="projects-grid">
              {isLoadingProjects ? (
                <p className="loading">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="empty">Your projects will appear here after you upload a floor plan.</p>
              ) : projects.map(({id, name, sourceImage, renderedImage, timestamp}) => (
              <Link key={id} to={`/visualizer/${id}`} className="project-card group text-inherit no-underline">
              <div className="preview">
                <img src={renderedImage || sourceImage}
                 alt="Project Preview" />
                <div className="badge"><span>Community</span></div>
              </div>
              <div className="card-body">
                <div>
                <h3>{name}</h3>
                <div className="meta">
                  <Clock size={12} />
                  <span>{new Date(timestamp).toLocaleDateString()}</span>
                  <span>By LRK</span>              
                </div>
                </div>
                <div className ="arrow">
                  <ArrowRight size={18} />
                </div>
              </div>
              </Link>
              ))}
            
          </div>
          </div>
      </section>
    </div>
  )
}
