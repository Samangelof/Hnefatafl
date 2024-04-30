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

    def move_piece(self, piece, new_row, new_col):
        if self.is_valid_move(piece, new_row, new_col):
            self.grid[piece.row][piece.col] = None
            self.place_piece(piece, new_row, new_col)

    def is_valid_move(self, piece, new_row, new_col):
        # проверка на допустимость хода
        pass

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
