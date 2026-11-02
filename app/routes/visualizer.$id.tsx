import { Link, useLocation, useParams } from "react-router";

export default function Visualizer() {
    const { id } = useParams();
    const location = useLocation();
    const state = location.state;
    const image =
        typeof state === "object" &&
        state !== null &&
        "image" in state &&
        typeof state.image === "string"
            ? state.image
            : null;

    return (
        <main className="visualizer">
            <header>
                <Link to="/">Roomify</Link>
                <h1>Floor plan visualizer</h1>
                {id && <p>Project {id}</p>}
            </header>
            {image ? (
                <img src={image} alt="Uploaded floor plan" />
            ) : (
                <p>
                    No floor plan was provided. <Link to="/">Upload an image</Link>
                </p>
            )}
        </main>
    );
}