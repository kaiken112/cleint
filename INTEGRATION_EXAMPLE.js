/**
 * Complete Integration Example
 * Copy this code into your Game.js component to integrate the new turn-based system
 */

import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import "../css/Game.css";

// Import new components
import ImprovedPlayPoints from "../components/ui/ImprovedPlayPoints";

// Import actions from improved slice
import {
  startTurn,
  endTurn,
  receiveTurnStart,
  receiveTurnEnd,
  playCardFromHandToField,
  setFirstPlayer,
  setRoom,
  setDeck,
  drawFromDeck,
} from "../redux/ImprovedGameSlice";

// Import socket
import { socket } from "../sockets";

// Import existing components (keep your originals)
import Selection from "../components/ui/Selection";
import PlayerUI from "../components/ui/PlayerUI";
import EnemyUI from "../components/ui/EnemyUI";
import ChatUI from "../components/ui/ChatUI";
import Hand from "../components/hand/Hand";
import Field from "../components/field/Field";
import ZoomedCard from "../components/ui/ZoomedCard";

export default function Game() {
  const dispatch = useDispatch();
  const constraintsRef = useRef(null);

  // Local UI state
  const [wallpaper, setWallpaper] = useState(
    require("../assets/wallpapers/3.png")
  );
  const [selectedOption, setSelectedOption] = useState("Galmieux");
  const [ready, setReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [readyToPlaceOnFieldFromHand, setReadyToPlaceOnFieldFromHand] =
    useState(false);

  // Redux state
  const isMyTurn = useSelector((state) => state.game.isMyTurn);
  const turnNumber = useSelector((state) => state.game.turnNumber);
  const reduxCurrentCard = useSelector((state) => state.game.currentCard);
  const room = useSelector((state) => state.game.room);

  // Socket event listeners for turn management
  useEffect(() => {
    // Listen for socket events
    const handleReceiveMsg = (data) => {
      console.log("Received socket message:", data);

      switch (data.type) {
        case "turnEnd":
          // Opponent ended their turn, now it's our turn
          dispatch(receiveTurnStart({ turnNumber: data.turnNumber }));
          break;

        case "turnStart":
          // Opponent started their turn
          dispatch(receiveTurnEnd());
          break;

        case "gameStart":
          // Game is starting, determine first player
          const amIFirstPlayer = data.firstPlayer === socket.id;
          dispatch(setFirstPlayer(amIFirstPlayer ? "player" : "opponent"));
          if (amIFirstPlayer) {
            dispatch(startTurn());
          }
          break;

        // Add handlers for other message types here
        case "playPoints":
          // Handle opponent play points update
          break;

        case "field":
          // Handle opponent field update
          break;

        // ... add other handlers from your original CardSlice

        default:
          console.log("Unhandled message type:", data.type);
      }
    };

    socket.on("receive msg", handleReceiveMsg);

    // Cleanup
    return () => {
      socket.off("receive msg", handleReceiveMsg);
    };
  }, [dispatch]);

  // Initialize game when room is joined
  useEffect(() => {
    if (room && !turnNumber) {
      // Determine first player (in real game, server decides this)
      const amIFirst = Math.random() < 0.5;
      dispatch(setFirstPlayer(amIFirst ? "player" : "opponent"));
      if (amIFirst) {
        dispatch(startTurn());
      }
    }
  }, [room, turnNumber, dispatch]);

  // Example: Initialize deck (adapt to your existing deck loading logic)
  useEffect(() => {
    // Load deck from your existing system
    const myDeck = [
      /* your deck cards */
    ];
    dispatch(setDeck(myDeck));
  }, [dispatch]);

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: `url(${wallpaper}) center center fixed`,
        backgroundSize: "cover",
      }}
    >
      <Selection setSelectedOption={setSelectedOption} />

      {/* Left side - Now with improved play points */}
      <div className={"leftSideCanvas"}>
        <ZoomedCard name={reduxCurrentCard} hovering={hovering} />
        {/* This is the new component! */}
        <ImprovedPlayPoints name={selectedOption} />

        {/* Optional: Add turn indicator */}
        <div
          style={{
            margin: "10px",
            padding: "10px",
            backgroundColor: isMyTurn
              ? "rgba(0, 255, 0, 0.3)"
              : "rgba(255, 0, 0, 0.3)",
            borderRadius: "8px",
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {isMyTurn ? `YOUR TURN (Turn ${turnNumber})` : "OPPONENT'S TURN"}
        </div>
      </div>

      {/* Center Field */}
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"centerCanvas"}
        style={{
          background:
            "radial-gradient(circle, rgba(60,105,134,1) 0%, rgba(18,53,87,1) 70%, rgba(18,41,87,1) 84%, rgba(11,26,55,1) 100%)",
        }}
        ref={constraintsRef}
      >
        <Field
          ready={ready}
          setReady={setReady}
          setHovering={setHovering}
          readyToPlaceOnFieldFromHand={readyToPlaceOnFieldFromHand}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
        />
        <Hand
          setHovering={setHovering}
          constraintsRef={constraintsRef}
          ready={ready}
          setReady={setReady}
          setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
          // Pass turn state to hand so it can validate actions
          isMyTurn={isMyTurn}
        />
      </motion.div>

      {/* Right side */}
      <div className={"rightSideCanvas"}>
        <EnemyUI />
        <PlayerUI name={selectedOption} />
        <ChatUI />
      </div>
    </div>
  );
}

/**
 * Integration Notes:
 *
 * 1. HAND COMPONENT:
 * You'll need to update your Hand component to use the new action:
 *
 * ```javascript
 * import { playCardFromHandToField } from "../../redux/ImprovedGameSlice";
 *
 * const handleCardDrop = (card, handIndex, fieldIndex) => {
 *   dispatch(playCardFromHandToField({ card, handIndex, fieldIndex }));
 * };
 * ```
 *
 * 2. FIELD COMPONENT:
 * Field component should check turn state before allowing interactions:
 *
 * ```javascript
 * const isMyTurn = useSelector((state) => state.game.isMyTurn);
 *
 * const handleFieldClick = (index) => {
 *   if (!isMyTurn) {
 *     console.warn("Not your turn!");
 *     return;
 *   }
 *   // ... rest of logic
 * };
 * ```
 *
 * 3. DRAW BUTTON:
 * Use the new draw action:
 *
 * ```javascript
 * import { drawFromDeck } from "../redux/ImprovedGameSlice";
 *
 * const handleDraw = () => {
 *   dispatch(drawFromDeck());
 * };
 * ```
 *
 * 4. ROOM JOINING:
 * When joining a room, set it in Redux:
 *
 * ```javascript
 * socket.emit("join_room", roomCode);
 * socket.on("joined_room", ({ room }) => {
 *   dispatch(setRoom(room));
 * });
 * ```
 *
 * 5. GRADUAL MIGRATION:
 * You can keep both systems running! Use the new system for turn/mana management
 * while keeping existing systems for other features:
 *
 * ```javascript
 * // Keep using old actions for other features
 * import {
 *   setHealth,
 *   setEvoPoints,
 *   // ... other old actions
 * } from "../redux/CardSlice";
 *
 * // Use new actions for turn/mana
 * import {
 *   startTurn,
 *   endTurn,
 *   playCardFromHandToField,
 * } from "../redux/ImprovedGameSlice";
 * ```
 */
