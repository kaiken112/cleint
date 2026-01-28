import React from "react";
import IconButton from "@mui/material/IconButton";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from "react-redux";
import { endTurn, addTempPlayPoints, addPermanentPlayPoints } from "../../redux/ImprovedGameSlice";
import "../../css/PlayPoints.css";

/**
 * Improved PlayPoints Component
 * - Shows current/max play points with visual indicators
 * - Only allows actions during player's turn
 * - Automatic mana refresh on turn start
 * - Manual adjustments for card effects
 */
export default function ImprovedPlayPoints() {
  const dispatch = useDispatch();
  
  // Redux state
  const isMyTurn = useSelector((state) => state.game.isMyTurn);
  const playPoints = useSelector((state) => state.game.playPoints);
  const tempPlayPoints = useSelector((state) => state.game.tempPlayPoints);
  const turnNumber = useSelector((state) => state.game.turnNumber);
  
  const { available, max } = playPoints;
  const totalAvailable = available + tempPlayPoints;
  
  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";
  const disabledColor = "rgba(128, 128, 128, 0.3)";
  
  // Handle end turn
  const handleEndTurn = () => {
    if (isMyTurn) {
      dispatch(endTurn());
    }
  };
  
  // Manual adjustments (for card effects)
  const handleAddTemp = () => {
    if (isMyTurn && totalAvailable < 10) {
      dispatch(addTempPlayPoints(1));
    }
  };
  
  const handleAddPermanent = () => {
    if (isMyTurn && max < 10) {
      dispatch(addPermanentPlayPoints(1));
    }
  };
  
  return (
    <div className="PlayPointsContainer">
      {/* Turn Indicator */}
      <div style={{
        textAlign: "center",
        padding: "10px",
        backgroundColor: isMyTurn ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)",
        borderRadius: "8px",
        marginBottom: "10px",
        color: "white",
        fontWeight: "bold"
      }}>
        {isMyTurn ? `YOUR TURN (${turnNumber})` : `OPPONENT'S TURN`}
      </div>
      
      {/* Mana Crystals Visual */}
      <div className="CircleContainer">
        <div className="circles">
          {[...Array(10)].map((_, idx) => {
            const isUnlocked = max >= idx + 1;
            const isFilled = totalAvailable >= idx + 1;
            const isTemp = available < idx + 1 && totalAvailable >= idx + 1;
            
            let className = "circle";
            if (!isUnlocked) {
              className = "circleLocked";
            } else if (!isFilled) {
              className = "circleFaded";
            } else if (isTemp) {
              className = "circleTemp";
            }
            
            return (
              <div
                key={`circle-${idx}`}
                className={className}
                style={isTemp ? { 
                  backgroundColor: "rgba(100, 200, 255, 0.8)",
                  border: "2px solid cyan"
                } : {}}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Play Points Display */}
      <div className="buttonsContainer">
        <div className="pointsContainer">
          <div className="points" style={{ fontSize: "24px", fontWeight: "bold" }}>
            {totalAvailable}/{max}
            {tempPlayPoints > 0 && (
              <span style={{ 
                fontSize: "14px", 
                color: "cyan",
                marginLeft: "5px"
              }}>
                (+{tempPlayPoints} temp)
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Manual Adjustment Controls (for card effects) */}
      <div style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginTop: "10px",
        flexWrap: "wrap"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "white", marginBottom: "5px" }}>
            Add Temp PP
          </div>
          <IconButton
            sx={{ 
              color: "white", 
              backgroundColor: isMyTurn && totalAvailable < 10 ? buttonBackgroundColor : disabledColor 
            }}
            onClick={handleAddTemp}
            disabled={!isMyTurn || totalAvailable >= 10}
            size="small"
          >
            <ExpandLessIcon />
          </IconButton>
        </div>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "white", marginBottom: "5px" }}>
            Add Perm PP
          </div>
          <IconButton
            sx={{ 
              color: "white", 
              backgroundColor: isMyTurn && max < 10 ? buttonBackgroundColor : disabledColor 
            }}
            onClick={handleAddPermanent}
            disabled={!isMyTurn || max >= 10}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </div>
      </div>
      
      {/* Turn Controls */}
      <div className="turnContainer" style={{ marginTop: "15px" }}>
        <button
          className="endTurnButton"
          onClick={handleEndTurn}
          disabled={!isMyTurn}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            fontWeight: "bold",
            backgroundColor: isMyTurn ? "rgba(255, 100, 100, 0.8)" : "rgba(128, 128, 128, 0.5)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isMyTurn ? "pointer" : "not-allowed",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            if (isMyTurn) {
              e.target.style.backgroundColor = "rgba(255, 50, 50, 1)";
            }
          }}
          onMouseLeave={(e) => {
            if (isMyTurn) {
              e.target.style.backgroundColor = "rgba(255, 100, 100, 0.8)";
            }
          }}
        >
          {isMyTurn ? "END TURN" : "WAITING..."}
        </button>
      </div>
      
      {/* Info Text */}
      <div style={{
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "center"
      }}>
        {isMyTurn 
          ? "Play cards by dragging them to the field. Cost is automatically deducted."
          : "Wait for opponent to finish their turn."
        }
      </div>
    </div>
  );
}
