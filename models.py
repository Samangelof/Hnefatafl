from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash, check_password_hash


db = SQLAlchemy()

class Piece:
    def __init__(self, type, row, col):
        self.type = type
        self.row = row
        self.col = col


class Board:
    def __init__(self):
        self.grid = [[None for _ in range(9)] for _ in range(9)]

    def place_piece(self, piece, row, col):
        self.grid[row][col] = piece
        piece.row = row
        piece.col = col

    def move_piece(self, piece, new_row, new_col, player_type):
        if self.is_valid_move(piece, new_row, new_col, player_type):
            self.grid[piece.row][piece.col] = None
            self.place_piece(piece, new_row, new_col)



    def is_valid_move(self, piece, new_row, new_col):
        # Check if the new position is within the board
        if new_row < 0 or new_row >= 9 or new_col < 0 or new_col >= 9:
            return False
        
        # Check if the new position is on the same row or column
        if piece.row != new_row and piece.col != new_col:
            return False

        # Check if the new position is empty or contains an opponent's piece
        if self.grid[new_row][new_col] is not None and self.grid[new_row][new_col].type == piece.type:
            return False

        return True
    
    def serialize(self):
        serialized_board = []
        for row in self.grid:
            serialized_row = []
            for cell in row:
                if cell is None:
                    serialized_row.append(None)
                else:
                    serialized_row.append({'type': cell.type})
            serialized_board.append(serialized_row)
        return serialized_board


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    achievements = db.Column(db.Text)
    kd_ratio = db.Column(db.Float)
    profile_picture = db.Column(db.String(255))
    status = db.Column(db.String(100))
    favorite_mode = db.Column(db.String(50))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"Player('{self.nickname}')"


class WebSocketConnection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    socket_id = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"WebSocketConnection(user_id={self.user_id}, socket_id={self.socket_id})"