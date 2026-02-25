import React from 'react';
import './TutorialPopup.css';

const TutorialPopup = ({ step, content, isVisible, onDismiss }) => {
    if (!isVisible) return null;

    return (
        <div className="tutorial-overlay">
            <div className={`tutorial-card step-${step}`}>
                <div className="tutorial-badge">Step {step}</div>
                <div className="tutorial-content">
                    <p>{content}</p>
                </div>
                {onDismiss && (
                    <button className="tutorial-dismiss" onClick={onDismiss}>
                        Got it!
                    </button>
                )}
                <div className="tutorial-glow"></div>
            </div>
        </div>
    );
};

export default TutorialPopup;
