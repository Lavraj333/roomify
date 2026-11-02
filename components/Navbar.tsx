import { Box } from 'lucide-react'
import Button from './ui/Button';
import { useOutletContext } from 'react-router';
import { useState } from 'react';
const Navbar = () => {
    const {isSignedIn, userName, signIn, signOut} = useOutletContext<AuthContext>()
    const [authError, setAuthError] = useState<string | null>(null);

    const handleAuthClick = async () => {
        setAuthError(null);
        if (isSignedIn) {
            try {
                await signOut();
            } catch (error) {
                console.error("Puter sign out failed:", error);
                setAuthError(getAuthErrorMessage(error));
            }
            return;
        }
        try {
            await signIn();
        } catch (error) {
            console.error("Puter sign in failed:", error);
            setAuthError(getAuthErrorMessage(error));
        }
    };

    const getAuthErrorMessage = (error: unknown) => {
        if (error instanceof Error) return error.message;
        if (typeof error === "object" && error !== null) {
            if ("msg" in error && typeof error.msg === "string") return error.msg;
            if ("message" in error && typeof error.message === "string") return error.message;
            if ("error" in error && typeof error.error === "string") return error.error;
        }
        return "Unable to complete authentication. Check the browser console for details.";
    };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
                    <div className="brand">
                        <Box className="logo" />
                        <span className="name">Roomify</span>
                    </div>

                    <ul className="links">
                        <a href="#">Products</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                    </ul>
        </div>
        <div className="actions">
                    {authError && <span className="auth-error" role="alert">{authError}</span>}
                    {isSignedIn ? (
                        <>
                            <span className="greeting">
                                {userName ? `Hi, ${userName}` : "Signed In"}
                            </span>
                            <Button size="sm" onClick={handleAuthClick} className="btn">
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAuthClick} size="sm" variant="ghost">
                                Log In
                            </Button>
                            <a href="#upload" className="cta">
                                Get Started
                            </a>
                        </>
                    )}
        </div>
      </nav>
    </header>
    );
}

export default Navbar