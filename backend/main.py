from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from typing import Dict, List, Optional
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Sample paragraphs for typing races
PARAGRAPHS = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Amazingly few discotheques provide jukeboxes. Sphinx of black quartz, judge my vow. Watch Jeopardy!, Alex Trebek's fun TV quiz game.",
    "Programming is the art of telling another human being what one wants the computer to do. Good code is its own best documentation.",
    "The five boxing wizards jump quickly. How razorback jumping frogs can level six piqued gymnasts! Crazy Fredrick bought many very exquisite opal jewels.",
    "A fast-paced typing game improves your speed and accuracy. Practice makes perfect when learning to type efficiently and without errors."
]

class ConnectionManager:
    """Manages WebSocket connections and game state"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.player_info: Dict[str, dict] = {}  # Maps WebSocket to player info
        self.current_paragraph: str = ""
        self.game_started: bool = False
        self.waiting_room: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket, player_name: str):
        """Connect a new player"""
        await websocket.accept()
        self.waiting_room.append(websocket)
        self.player_info[websocket] = {
            "name": player_name,
            "progress": 0,
            "finished": False,
            "rank": 0,
            "connection": websocket
        }
        
        # Inform the new player about all other players
        players_data = [{"name": info["name"], "progress": info["progress"]} 
                        for ws, info in self.player_info.items()]
        await websocket.send_json({
            "type": "players_list",
            "players": players_data,
            "game_started": self.game_started
        })
        
        # Broadcast new player to all other players
        await self.broadcast_new_player(player_name)
    
    async def disconnect(self, websocket: WebSocket):
        """Remove a player when they disconnect"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if websocket in self.waiting_room:
            self.waiting_room.remove(websocket)
            
        if websocket in self.player_info:
            player_name = self.player_info[websocket]["name"]
            del self.player_info[websocket]
            
            # Notify remaining players about the disconnection
            await self.broadcast_to_all({
                "type": "player_disconnected",
                "player_name": player_name
            })
    
    async def broadcast_to_all(self, data):
        """Send data to all connected players"""
        connection_list = self.active_connections if self.game_started else self.waiting_room
        for connection in connection_list:
            try:
                await connection.send_json(data)
            except Exception:
                pass
    
    async def broadcast_new_player(self, player_name: str):
        """Inform all players about a new player"""
        await self.broadcast_to_all({
            "type": "new_player",
            "player_name": player_name
        })
    
    async def start_game(self):
        """Start the typing race game"""
        if len(self.waiting_room) < 2:
            return False  # Not enough players
        
        # Move waiting players to active connections
        self.active_connections = self.waiting_room.copy()
        self.waiting_room = []
        
        # Select a random paragraph
        self.current_paragraph = random.choice(PARAGRAPHS)
        self.game_started = True
        
        # Reset all player progress
        for player in self.player_info.values():
            player["progress"] = 0
            player["finished"] = False
            player["rank"] = 0
        
        # Notify all players about game start
        await self.broadcast_to_all({
            "type": "game_start",
            "paragraph": self.current_paragraph
        })
        
        return True
    
    async def update_progress(self, websocket: WebSocket, progress: float):
        """Update a player's progress and broadcast to all"""
        if websocket in self.player_info:
            self.player_info[websocket]["progress"] = progress
            
            # Check if player just finished
            if progress >= 100 and not self.player_info[websocket]["finished"]:
                self.player_info[websocket]["finished"] = True
                
                # Calculate rank
                current_rank = sum(1 for p in self.player_info.values() 
                                 if p["finished"] and p["connection"] != websocket) + 1
                self.player_info[websocket]["rank"] = current_rank
                
                # Notify about player finishing
                await self.broadcast_to_all({
                    "type": "player_finished",
                    "player_name": self.player_info[websocket]["name"],
                    "rank": current_rank
                })
                
                # Check if all players finished
                if all(p["finished"] for p in self.player_info.values() if p["connection"] in self.active_connections):
                    # Game over, send final rankings
                    rankings = sorted(
                        [(info["name"], info["rank"]) for ws, info in self.player_info.items() 
                         if ws in self.active_connections],
                        key=lambda x: x[1]
                    )
                    await self.broadcast_to_all({
                        "type": "game_over",
                        "rankings": rankings
                    })
                    # Reset game state
                    self.game_started = False
                    self.waiting_room = self.active_connections.copy()
                    self.active_connections = []
            
            # Broadcast progress update to all players
            await self.broadcast_to_all({
                "type": "progress_update",
                "player_name": self.player_info[websocket]["name"],
                "progress": progress
            })


manager = ConnectionManager()

@app.get("/")
async def get():
    return {"message": "Typing Race Multiplayer Game API"}

@app.websocket("/ws/{player_name}")
async def websocket_endpoint(websocket: WebSocket, player_name: str):
    await manager.connect(websocket, player_name)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "start_game":
                success = await manager.start_game()
                if not success:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Need at least 2 players to start the game"
                    })
            
            elif message["type"] == "progress_update":
                await manager.update_progress(websocket, message["progress"])
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)