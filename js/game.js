// Game constants
const BOARD_SIZE = 5;
const TIGERS = 4;
const GOATS = 20;

class TigerGoatGame {
    constructor() {
        this.board = [];
        this.tigersPosition = [];
        this.goatsPosition = [];
        this.currentPlayer = 'goat'; // Goat starts first
        this.goatsPlaced = 0;
        this.goatsCaptured = 0;
        this.gameOver = false;
        this.selectedPiece = null;
        
        this.initBoard();
    }
    
    initBoard() {
        // Create 5x5 board
        for (let i = 0; i < BOARD_SIZE; i++) {
            this.board[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.board[i][j] = null;
            }
        }
        
        // Place tigers at corners
        this.tigersPosition = [
            {x: 0, y: 0},
            {x: 0, y: BOARD_SIZE-1},
            {x: BOARD_SIZE-1, y: 0},
            {x: BOARD_SIZE-1, y: BOARD_SIZE-1}
        ];
        
        this.tigersPosition.forEach(pos => {
            this.board[pos.x][pos.y] = 'tiger';
        });
    }
    
    // Get valid moves for a piece
    getValidMoves(x, y, piece) {
        const moves = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Horizontal/Vertical
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal
        ];
        
        directions.forEach(([dx, dy]) => {            const newX = x + dx;
            const newY = y + dy;
            
            if (this.isValidPosition(newX, newY)) {
                if (this.board[newX][newY] === null) {
                    // Simple move
                    moves.push({x: newX, y: newY, capture: false});
                } else if (piece === 'tiger' && this.board[newX][newY] === 'goat') {
                    // Capture move
                    const jumpX = newX + dx;
                    const jumpY = newY + dy;
                    if (this.isValidPosition(jumpX, jumpY) && 
                        this.board[jumpX][jumpY] === null) {
                        moves.push({x: jumpX, y: jumpY, capture: true, 
                                   capturedGoat: {x: newX, y: newY}});
                    }
                }
            }
        });
        
        return moves;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
    }
    
    // Move piece
    movePiece(fromX, fromY, toX, toY) {
        const piece = this.board[fromX][fromY];
        if (!piece) return false;
        
        const validMoves = this.getValidMoves(fromX, fromY, piece);
        const move = validMoves.find(m => m.x === toX && m.y === toY);
        
        if (!move) return false;
        
        // Execute move
        this.board[toX][toY] = piece;
        this.board[fromX][fromY] = null;
        
        // Update position arrays
        if (piece === 'tiger') {
            const tigerIdx = this.tigersPosition.findIndex(p => p.x === fromX && p.y === fromY);
            this.tigersPosition[tigerIdx] = {x: toX, y: toY};
        } else {
            const goatIdx = this.goatsPosition.findIndex(p => p.x === fromX && p.y === fromY);
            this.goatsPosition[goatIdx] = {x: toX, y: toY};
        }
                // Handle capture
        if (move.capture) {
            this.board[move.capturedGoat.x][move.capturedGoat.y] = null;
            const goatIdx = this.goatsPosition.findIndex(p => 
                p.x === move.capturedGoat.x && p.y === move.capturedGoat.y);
            this.goatsPosition.splice(goatIdx, 1);
            this.goatsCaptured++;
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'tiger' ? 'goat' : 'tiger';
        
        // Check win condition
        this.checkWinCondition();
        
        return true;
    }
    
    // Place a new goat (only during placement phase)
    placeGoat(x, y) {
        if (this.goatsPlaced >= GOATS || this.board[x][y] !== null) {
            return false;
        }
        
        this.board[x][y] = 'goat';
        this.goatsPosition.push({x, y});
        this.goatsPlaced++;
        
        this.currentPlayer = 'tiger';
        this.checkWinCondition();
        return true;
    }
    
    checkWinCondition() {
        // Tigers win if 5 goats captured
        if (this.goatsCaptured >= 5) {
            this.gameOver = true;
            alert('🐯 Tigers Win!');
            return;
        }
        
        // Goats win if all tigers are blocked
        const tigersBlocked = this.tigersPosition.every(pos => {
            return this.getValidMoves(pos.x, pos.y, 'tiger').length === 0;
        });
        
        if (tigersBlocked) {
            this.gameOver = true;
            alert('🐐 Goats Win!');
            return;        }
    }
    
    // Simple AI for computer opponent
    getAIMove() {
        const aiPiece = this.currentPlayer;
        const positions = aiPiece === 'tiger' ? this.tigersPosition : this.goatsPosition;
        
        // Find all valid moves
        const allMoves = [];
        
        if (aiPiece === 'goat' && this.goatsPlaced < GOATS) {
            // Place a goat
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (this.board[i][j] === null) {
                        allMoves.push({type: 'place', x: i, y: j});
                    }
                }
            }
        } else {
            // Move existing piece
            positions.forEach(pos => {
                const moves = this.getValidMoves(pos.x, pos.y, aiPiece);
                moves.forEach(move => {
                    allMoves.push({
                        type: 'move',
                        from: pos,
                        to: move
                    });
                });
            });
        }
        
        // Simple AI: prioritize captures for tigers, blocking for goats
        if (allMoves.length > 0) {
            // Random move for now (you can implement Minimax here)
            return allMoves[Math.floor(Math.random() * allMoves.length)];
        }
        
        return null;
    }
}

// Canvas rendering
function drawBoard(game) {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / BOARD_SIZE;
        // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    
    // Draw horizontal and vertical lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
    }
    
    // Draw diagonal lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (i < BOARD_SIZE - 1 && j < BOARD_SIZE - 1) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, j * cellSize);
                ctx.lineTo((i + 1) * cellSize, (j + 1) * cellSize);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo((i + 1) * cellSize, j * cellSize);
                ctx.lineTo(i * cellSize, (j + 1) * cellSize);
                ctx.stroke();
            }
        }
    }
    
    // Draw pieces
    game.tigersPosition.forEach(pos => {
        drawPiece(ctx, pos.x, pos.y, cellSize, '🐯');
    });
    
    game.goatsPosition.forEach(pos => {
        drawPiece(ctx, pos.x, pos.y, cellSize, '🐐');
    });
}

function drawPiece(ctx, x, y, cellSize, emoji) {
    const centerX = x * cellSize + cellSize / 2;
    const centerY = y * cellSize + cellSize / 2;    const radius = cellSize / 2 - 5;
    
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, centerX, centerY);
}

// Initialize game
let game = new TigerGoatGame();
drawBoard(game);
