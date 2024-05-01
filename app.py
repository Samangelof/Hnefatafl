from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_bcrypt import Bcrypt
from models import Piece, Board, Player, db

app = Flask(__name__, template_folder='template')
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db.init_app(app)
board = Board()

@app.route('/', methods=['GET'])
def show_register_form():
    return render_template('auth.html')

@app.route('/register', methods=['POST'])
def register():
    nickname = request.form.get('nickname')

    # Проверяем, нет ли уже пользователя с таким никнеймом
    existing_user = Player.query.filter_by(nickname=nickname).first()
    if existing_user:
        return redirect(url_for('game'))

    # Хэшируем пароль
    hashed_password = bcrypt.generate_password_hash(request.form.get('password_hash')).decode('utf-8')

    # Создаем нового пользователя
    new_user = Player(nickname=nickname, password_hash=hashed_password)

    # Сохраняем пользователя в базе данных
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('game'))

@app.route('/game') 
def game():
    # создаем список фигур для атаки
    attackers = [
        Piece(type='attacker', row=4, col=0),
        Piece(type='attacker', row=4, col=1), 
        Piece(type='attacker', row=4, col=8),
        Piece(type='attacker', row=1, col=4),
        Piece(type='attacker', row=4, col=7),
        Piece(type='attacker', row=7, col=4),
        Piece(type='attacker', row=8, col=3),
        Piece(type='attacker', row=8, col=5),
        Piece(type='attacker', row=0, col=5),
        Piece(type='attacker', row=0, col=3),
        Piece(type='attacker', row=3, col=0),
        Piece(type='attacker', row=3, col=8),
        Piece(type='attacker', row=5, col=8),
        Piece(type='attacker', row=5, col=0),
        Piece(type='attacker', row=0, col=4),
        Piece(type='attacker', row=8, col=4)
    ]

    # создаем список фигур для защиты
    defenders = [
        Piece(type='defender', row=4, col=2),
        Piece(type='defender', row=4, col=3),
        Piece(type='defender', row=4, col=5),
        Piece(type='defender', row=4, col=6),
        Piece(type='defender', row=2, col=4),
        Piece(type='defender', row=3, col=4),
        Piece(type='defender', row=5, col=4),
        Piece(type='defender', row=6, col=4)
    ]
    king = Piece(type='king', row=4, col=4)  # позиция короля посередине доски
    board.place_piece(king, king.row, king.col)

    for piece in attackers + defenders:
        board.place_piece(piece, piece.row, piece.col)

    context = {
        'board': board,
        'attackers': attackers,
        'defenders': defenders,
        'king': king
    }

    return render_template('board.html', **context)

@app.route('/move/<int:from_row>/<int:from_col>/<int:to_row>/<int:to_col>/<player_type>')
def move_piece(from_row, from_col, to_row, to_col, player_type):
    piece = board.grid[from_row][from_col]
    if piece is None or piece.type != player_type:
        return "Invalid move"
    
    # проверяем новую позицию в пределах доски
    if to_row < 0 or to_row >= 9 or to_col < 0 or to_col >= 9:
        return "Invalid move"
    
    # проверяем, что новая позиция находится на той же горизонтали или вертикали
    if from_row != to_row and from_col != to_col:
        return "Invalid move"
    
    # проверяем новую позицию пустая она или содержит фигуру противника
    if board.grid[to_row][to_col] is not None and board.grid[to_row][to_col].type == player_type:
        return "Invalid move"
    
    # перемещаем фигуру на новую позицию
    board.grid[to_row][to_col] = piece
    board.grid[from_row][from_col] = None

    # отправляем данные на фронт
    response_data = {
        'message': 'Move successful',
        'from_row': from_row,
        'from_col': from_col,
        'to_row': to_row,
        'to_col': to_col,
        'player_type': player_type
    }

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)