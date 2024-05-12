from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    request,
    jsonify,
    session
)
from flask_bcrypt import Bcrypt
from flask_socketio import SocketIO, emit, disconnect
from flask_migrate import Migrate
from models import (
    Piece,
    Board,
    Player,
    db,
    WebSocketConnection
)


app = Flask(__name__, template_folder='template')
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'uor=^_tbh_4cfmf-8g4@g$c&v2u!e$q1m_ots_$a*30x83#40v' # .env
db.init_app(app)
board = Board()
socketio = SocketIO(app)
migrate = Migrate(app, db)


@app.route('/', methods=['GET'])
def show_register_form():
    return render_template('auth.html')


@app.route('/register', methods=['POST'])
def register():
    nickname = request.form.get('nickname')
    session['nickname'] = nickname
    print('[register NICKNAME]', nickname)
    # Проверяем, нет ли уже пользователя с таким никнеймом
    existing_user = Player.query.filter_by(nickname=nickname).first()
    if existing_user:
        return redirect(url_for('menu'))

    # Хэшируем пароль
    hashed_password = bcrypt.generate_password_hash(request.form.get('password_hash')).decode('utf-8')

    # Создаем нового пользователя
    new_user = Player(nickname=nickname, password_hash=hashed_password)

    # Сохраняем пользователя в базе данных
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('menu'))

@app.route('/menu', methods=['GET'])
def menu():
    # nickname = request.args.get('nickname') 
    # nickname = request.form.get('nickname')
    nickname = session.get('nickname') 
    print('[menu NICKNAME]', nickname)
    return render_template('main_menu.html', nickname=nickname)

@app.route('/game') 
def game():
    nickname = session.get('nickname') 
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
    # позиция короля посередине доски
    king = Piece(type='king', row=4, col=4)  
    board.place_piece(king, king.row, king.col)

    for piece in attackers + defenders:
        board.place_piece(piece, piece.row, piece.col)

    context = {
        'board': board,
        'attackers': attackers,
        'defenders': defenders,
        'king': king,
        'nickname': nickname
    }

    return render_template('board.html', **context)

# для бота
@app.route('/move/<int:from_row>/<int:from_col>/<int:to_row>/<int:to_col>/<player_type>')
def move_piece_bot(from_row, from_col, to_row, to_col, player_type):
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



# Онлайн
@socketio.on('connect')
def handle_connect():
    nickname = session.get('nickname')
    print(f'[req.args]{request.args}')
    emit('user_connected', {'nickname': nickname}, broadcast=True)
    print(f'[conn nick] {nickname}')
    # Создаем запись о подключении в базе данных
    connection = WebSocketConnection(nickname=nickname, socket_id=request.sid)
    db.session.add(connection)
    db.session.commit()


@app.route('/move_piece', methods=['POST'])
def move_piece_handler():
    data = request.json
    print(F'[MOVE_PIECE] {data}')
    socketio.emit('move_piece', data, broadcast=True)
    return 'Move piece request received', 200

    
@socketio.on('move_piece')
def handle_move_piece(data):
    from_row = data['from_row']
    from_col = data['from_col']
    to_row = data['to_row']
    to_col = data['to_col']
    player_type = data['player_type']

    if board.is_valid_move(board.grid[from_row][from_col], to_row, to_col):
        board.move_piece(board.grid[from_row][from_col], to_row, to_col)
        emit('update_board', {'board': board.serialize()}, broadcast=True)
    else:
        emit('move_error', {'message': 'Invalid move'})



@socketio.on('disconnect')
def handle_disconnect():
    connection = WebSocketConnection.query.filter_by(socket_id=request.sid).first()
    if connection:
        # удаляем запись о подключении из базы данных
        db.session.delete(connection)
        db.session.commit()
        emit('user_disconnected', {'nickname': connection.nickname}, broadcast=True)

@socketio.on_error_default
def default_error_handler(e):
    # отправляем сообщение об ошибке на клиент и отключаем соединение
    emit('error', {'message': 'An error occurred: {}'.format(e)})
    disconnect()



# чат
@socketio.on('message')
def handle_message(message):
    nickname = session.get('nickname')
    print('Received message from ' + nickname + ': ' + message)
    emit('message', {'nickname': nickname, 'message': message}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=True)