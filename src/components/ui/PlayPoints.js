import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { socket } from "../../sockets";
import IconButton from "@mui/material/IconButton";
import "../../css/PlayPoints.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { 
  startTurn, 
  endTurn, 
  addTempPlayPoints,
  addPermanentPlayPoints,
  manualSetPlayPoints, // For manual adjustments only
  setRoom // Import setRoom to sync rooms
} from "../../redux/ImprovedGameSlice";

export default function Scoreboard({ name }) {
  const dispatch = useDispatch();

  // NEW: Use game slice instead of card slice
  const reduxMaxPlayPoints = useSelector((state) => state.game.playPoints.max);
  const reduxCurrentPlayPoints = useSelector((state) => state.game.playPoints.available);
  const reduxTempPlayPoints = useSelector((state) => state.game.tempPlayPoints);
  const reduxIsMyTurn = useSelector((state) => state.game.isMyTurn);
  const reduxTurnNumber = useSelector((state) => state.game.turnNumber);
  const reduxRoom = useSelector((state) => state.game.room);
  
  // Get room from old CardSlice to sync
  const cardSliceRoom = useSelector((state) => state.card.room);
  
  // Sync room from CardSlice to game slice on mount
  useEffect(() => {
    if (cardSliceRoom && !reduxRoom) {
      console.log('🔄 Syncing room to game slice:', cardSliceRoom);
      dispatch(setRoom(cardSliceRoom));
    }
  }, [cardSliceRoom, reduxRoom, dispatch]);

  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";
  
  // Total available PP (permanent + temporary)
  const totalAvailablePlayPoints = reduxCurrentPlayPoints + reduxTempPlayPoints;

  /**
   * START YOUR TURN - Automatically refreshes play points
   */
  const handleStartTurn = () => {
    dispatch(startTurn());
  };

  /**
   * END YOUR TURN - Passes turn to opponent
   */
  const handleEndTurn = () => {
    dispatch(endTurn());
  };

  // ===== MANUAL ADJUSTMENTS (for emergencies/testing only) =====
  const incrementCurrent = () => {
    if (reduxCurrentPlayPoints < reduxMaxPlayPoints) {
      dispatch(
        manualSetPlayPoints({
          available: reduxCurrentPlayPoints + 1,
          max: reduxMaxPlayPoints,
        }),
      );
    }
  };

  const decrementCurrent = () => {
    if (reduxCurrentPlayPoints > 0) {
      dispatch(
        manualSetPlayPoints({
          available: reduxCurrentPlayPoints - 1,
          max: reduxMaxPlayPoints,
        }),
      );
    }
  };

  const incrementMax = () => {
    if (reduxMaxPlayPoints < 10) {
      dispatch(
        manualSetPlayPoints({
          available: reduxCurrentPlayPoints,
          max: reduxMaxPlayPoints + 1,
        }),
      );
    }
  };

  const decrementMax = () => {
    if (reduxMaxPlayPoints > 0 && reduxMaxPlayPoints > reduxCurrentPlayPoints) {
      dispatch(
        manualSetPlayPoints({
          available: reduxCurrentPlayPoints,
          max: reduxMaxPlayPoints - 1,
        }),
      );
    }
  };

  const decrementMultiple = (idx) => {
    dispatch(
      manualSetPlayPoints({
        available: idx - 1,
        max: reduxMaxPlayPoints,
      }),
    );
  };

  const incrementMultiple = (idx) => {
    dispatch(
      manualSetPlayPoints({
        available: idx,
        max: reduxMaxPlayPoints,
      }),
    );
  };

  return (
    <div className="PlayPointsContainer">
      {/* Turn indicator */}
      <div style={{
        position: "absolute",
        top: "-40px",
        left: "50%",
        transform: "translateX(-50%)",
        background: reduxIsMyTurn ? "rgba(76, 175, 80, 0.9)" : "rgba(255, 152, 0, 0.9)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        Turn {reduxTurnNumber} - {reduxIsMyTurn ? "Your Turn" : "Opponent's Turn"}
      </div>

      <div className="CircleContainer">
        <div className="circles">
          {[...Array(10)].map((x, idx) =>
            reduxMaxPlayPoints >= idx + 1 ? (
              totalAvailablePlayPoints >= idx + 1 ? (
                <div
                  onClick={() => decrementMultiple(idx + 1)}
                  key={`circle-${idx}`}
                  className="circle"
                  style={{
                    // Show temp PP in different color
                    background: idx + 1 > reduxCurrentPlayPoints ? "rgba(100, 200, 255, 0.8)" : undefined
                  }}
                >
                  {idx + 1}
                </div>
              ) : (
                <div
                  onClick={() => incrementMultiple(idx + 1)}
                  key={`circleFaded-${idx}`}
                  className="circleFaded"
                >
                  {idx + 1}
                </div>
              )
            ) : (
              <div key={`${idx}`}></div>
            ),
          )}
        </div>
      </div>

      <div className="IncDecContainer">
        <div className="inc">
          {reduxMaxPlayPoints < 10 ? (
            <IconButton
              sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
              onClick={() => incrementMax()}
              title="Add max play point (manual)"
            >
              <AddIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
                className="incButton"
              />
            </IconButton>
          ) : (
            <IconButton disabled>
              <AddIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
                className="incButton"
              />
            </IconButton>
          )}
        </div>

        <div className="dec">
          {reduxMaxPlayPoints > 0 &&
          reduxMaxPlayPoints > reduxCurrentPlayPoints ? (
            <IconButton
              sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
              onClick={() => decrementMax()}
              title="Remove max play point (manual)"
            >
              <RemoveIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
              />
            </IconButton>
          ) : (
            <IconButton disabled>
              <RemoveIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
              />
            </IconButton>
          )}
        </div>
      </div>

      <div className="buttonsContainer">
        <div className="pointsContainer">
          <div className="upArrowContainer">
            {reduxCurrentPlayPoints < 10 && reduxMaxPlayPoints > 0 ? (
              <IconButton
                sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
                onClick={() => incrementCurrent()}
                title="Add available play point (manual)"
              >
                <ExpandLessIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                  className="incButton"
                />
              </IconButton>
            ) : (
              <IconButton disabled>
                <AddIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                  className="incButton"
                />
              </IconButton>
            )}
          </div>
          <div className="points">
            {totalAvailablePlayPoints}/{reduxMaxPlayPoints}
            {reduxTempPlayPoints > 0 && (
              <div style={{
                fontSize: "10px",
                color: "rgba(100, 200, 255, 1)",
                marginTop: "2px"
              }}>
                (+{reduxTempPlayPoints} temp)
              </div>
            )}
          </div>
          <div className="downArrowContainer">
            {reduxMaxPlayPoints > 0 ? (
              <IconButton
                sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
                onClick={() => decrementCurrent()}
                title="Remove available play point (manual)"
              >
                <ExpandMoreIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                />
              </IconButton>
            ) : (
              <IconButton disabled>
                <RemoveIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                />
              </IconButton>
            )}
          </div>
        </div>
      </div>

      <div className="turnContainer">
        <div 
          className="nextTurnContainer"
          style={{
            opacity: reduxIsMyTurn ? 0.5 : 1,
            cursor: reduxIsMyTurn ? "not-allowed" : "pointer"
          }}
        >
          <div 
            className="buttonText" 
            onClick={() => !reduxIsMyTurn && handleStartTurn()}
            title={reduxIsMyTurn ? "Already your turn" : "Start your turn (auto-refreshes PP)"}
          >
            Start Turn
          </div>
        </div>
        <div 
          className="endTurnContainer"
          style={{
            opacity: !reduxIsMyTurn ? 0.5 : 1,
            cursor: !reduxIsMyTurn ? "not-allowed" : "pointer"
          }}
        >
          <div 
            className="buttonText" 
            onClick={() => reduxIsMyTurn && handleEndTurn()}
            title={!reduxIsMyTurn ? "Not your turn" : "End your turn"}
          >
            End Turn
          </div>
        </div>
      </div>
    </div>
  );
}
